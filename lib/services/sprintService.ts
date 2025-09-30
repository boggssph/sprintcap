/**
 * Sprint Service - Business logic for sprint management
 */

import { prisma } from '../prisma'
import { validateCreateSprintRequest, validateSprintDates, CreateSprintRequest } from '../validations/sprint'

export interface SprintResponse {
  id: string
  name: string
  squadId: string
  squadName: string
  startDate: string
  endDate: string
  status: string
  memberCount: number
  createdAt: string
}

export interface SprintDetailResponse {
  id: string
  name: string
  squadId: string
  squadName: string
  startDate: string
  endDate: string
  members: SprintMemberResponse[]
  createdAt: string
  updatedAt: string
}

export interface SprintMemberResponse {
  id: string
  userId: string
  displayName: string
  email: string
  joinedAt: string
}

export interface SprintListResponse {
  sprints: SprintSummary[]
  total: number
  limit: number
  offset: number
}

export interface SprintSummary {
  id: string
  name: string
  squadName: string
  startDate: string
  endDate: string
  memberCount: number
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

export class SprintServiceError extends Error {
  constructor(message: string, public code: string = 'SPRINT_ERROR') {
    super(message)
    this.name = 'SprintServiceError'
  }
}

/**
 * Creates a new sprint with automatic member population
 */
export async function createSprint(
  userId: string,
  userRole: string,
  data: CreateSprintRequest
): Promise<SprintResponse> {
  // Validate input
  const validationErrors = validateCreateSprintRequest(data)
  if (validationErrors.length > 0) {
    throw new SprintServiceError(
      `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
      'VALIDATION_ERROR'
    )
  }

  // Verify user is a Scrum Master
  if (userRole !== 'SCRUM_MASTER') {
    throw new SprintServiceError('Only Scrum Masters can create sprints', 'PERMISSION_DENIED')
  }

  // Verify squad exists and user owns it
  const squad = await prisma.squad.findUnique({
    where: { id: data.squadId }
  })

  if (!squad) {
    throw new SprintServiceError('Squad not found', 'NOT_FOUND')
  }

  if (squad.scrumMasterId !== userId) {
    throw new SprintServiceError('Access denied: You do not own this squad', 'PERMISSION_DENIED')
  }

  // Check for duplicate sprint name within the squad
  const existingSprint = await prisma.sprint.findFirst({
    where: {
      squadId: data.squadId,
      name: data.name
    }
  })

  if (existingSprint) {
    throw new SprintServiceError(
      `A sprint with the name '${data.name}' already exists in this squad`,
      'CONFLICT'
    )
  }

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)

  // Validate business rules for dates
  const dateErrors = validateSprintDates(startDate, endDate)
  if (dateErrors.length > 0) {
    throw new SprintServiceError(
      `Date validation failed: ${dateErrors.map(e => e.message).join(', ')}`,
      'VALIDATION_ERROR'
    )
  }

  // Check for overlapping sprints
  const overlappingSprint = await prisma.sprint.findFirst({
    where: {
      squadId: data.squadId,
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gt: startDate } }
          ]
        },
        {
          AND: [
            { startDate: { lt: endDate } },
            { endDate: { gte: endDate } }
          ]
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        }
      ]
    }
  })

  if (overlappingSprint) {
    throw new SprintServiceError(
      `Sprint dates overlap with existing sprint '${overlappingSprint.name}'`,
      'CONFLICT'
    )
  }

  // Get active squad members for automatic population
  const squadMembers = await prisma.squadMember.findMany({
    where: { squadId: data.squadId },
    include: {
      user: {
        select: { displayName: true, email: true }
      }
    }
  })

  // Create sprint in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the sprint
    const sprint = await tx.sprint.create({
      data: {
        name: data.name,
        squadId: data.squadId,
        startDate,
        endDate,
        status: 'INACTIVE'
      }
    })

    // Create sprint members for all active squad members
    if (squadMembers.length > 0) {
      await tx.sprintMember.createMany({
        data: squadMembers.map(member => ({
          sprintId: sprint.id,
          userId: member.userId
        }))
      })
    }

    return {
      sprint,
      memberCount: squadMembers.length,
      squadName: squad.name
    }
  })

  return {
    id: result.sprint.id,
    name: result.sprint.name,
    squadId: result.sprint.squadId,
    squadName: result.squadName,
    startDate: result.sprint.startDate.toISOString(),
    endDate: result.sprint.endDate.toISOString(),
    status: result.sprint.status,
    memberCount: result.memberCount,
    createdAt: result.sprint.createdAt.toISOString()
  }
}

/**
 * Lists sprints for user's squads with filtering and pagination
 */
export async function listSprints(
  userId: string,
  userRole: string,
  filters: {
    squadId?: string
    status?: 'active' | 'upcoming' | 'completed'
    limit?: number
    offset?: number
  } = {}
): Promise<SprintListResponse> {
  const { squadId, status, limit = 20, offset = 0 } = filters

  // Build where clause
  const where: Record<string, unknown> = {}

  if (squadId) {
    // If specific squad requested, verify ownership
    const squad = await prisma.squad.findUnique({
      where: { id: squadId }
    })

    if (!squad) {
      throw new SprintServiceError('Squad not found', 'NOT_FOUND')
    }

    if (userRole !== 'SCRUM_MASTER' || squad.scrumMasterId !== userId) {
      throw new SprintServiceError('Access denied', 'PERMISSION_DENIED')
    }

    where.squadId = squadId
  } else {
    // Get all squads owned by this Scrum Master
    if (userRole !== 'SCRUM_MASTER') {
      throw new SprintServiceError('Only Scrum Masters can list sprints', 'PERMISSION_DENIED')
    }

    const ownedSquads = await prisma.squad.findMany({
      where: { scrumMasterId: userId },
      select: { id: true }
    })

    where.squadId = {
      in: ownedSquads.map(s => s.id)
    }
  }

  // Apply status filter
  if (status) {
    const now = new Date()
    switch (status) {
      case 'upcoming':
        where.startDate = { gt: now }
        break
      case 'active':
        where.startDate = { lte: now }
        where.endDate = { gte: now }
        break
      case 'completed':
        where.endDate = { lt: now }
        break
    }
  }

  // Get total count
  const total = await prisma.sprint.count({ where })

  // Get sprints with squad info
  const sprints = await prisma.sprint.findMany({
    where,
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      status: true,
      squadId: true,
      _count: {
        select: { members: true }
      },
      squad: {
        select: { name: true }
      }
    },
    orderBy: { startDate: 'desc' },
    take: limit,
    skip: offset
  })

  const sprintSummaries: SprintSummary[] = sprints.map(sprint => {
    return {
      id: sprint.id,
      name: sprint.name,
      squadName: sprint.squad?.name ?? '',
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      memberCount: sprint._count?.members ?? 0,
      status: sprint.status as 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
    }
  })

  return {
    sprints: sprintSummaries,
    total,
    limit,
    offset
  }
}

/**
 * Gets detailed information about a specific sprint
 */
export async function getSprint(
  userId: string,
  userRole: string,
  sprintId: string
): Promise<SprintDetailResponse> {
  // Get sprint with all related data
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: {
      squad: {
        select: { name: true, scrumMasterId: true }
      },
      members: {
        include: {
          user: {
            select: { displayName: true, email: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!sprint) {
    throw new SprintServiceError('Sprint not found', 'NOT_FOUND')
  }

  // Check access permissions
  if (userRole !== 'SCRUM_MASTER' || sprint.squad.scrumMasterId !== userId) {
    throw new SprintServiceError('Access denied', 'PERMISSION_DENIED')
  }

  const members: SprintMemberResponse[] = sprint.members.map(member => ({
    id: member.id,
    userId: member.userId,
    displayName: member.user.displayName || member.user.email,
    email: member.user.email,
    joinedAt: member.createdAt.toISOString()
  }))

  return {
    id: sprint.id,
    name: sprint.name,
    squadId: sprint.squadId,
    squadName: sprint.squad.name,
    startDate: sprint.startDate.toISOString(),
    endDate: sprint.endDate.toISOString(),
    members,
    createdAt: sprint.createdAt.toISOString(),
    updatedAt: sprint.updatedAt.toISOString()
  }
}