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
  warning?: string
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
  squadId?: string
  squadName: string
  startDate: string
  endDate: string
  memberCount: number
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

export interface SprintForScrumMaster {
  id: string
  name: string
  startDate: string
  endDate: string
  squadId: string
  squadName: string
  isActive: boolean
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

  // Check for duplicate sprint name within the squad (normalize to spec format)
  const expectedName = data.name.trim();
  const existingSprint = await prisma.sprint.findFirst({
    where: {
      squadId: data.squadId,
      name: expectedName
    }
  })

  if (existingSprint) {
    throw new SprintServiceError(
      `A sprint with the name '${expectedName}' already exists in this squad`,
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

  // Check for overlapping sprints (name format already normalized above)
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

  // Filter out members with invalid users (orphaned records)
  const validSquadMembers = squadMembers.filter(member => member.user !== null)

  // If no members, set a warning to be returned in the API response
  let warning: string | undefined = undefined;
  if (validSquadMembers.length === 0) {
    warning = 'Sprint created with no members. Add members manually if needed.';
  }

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
    if (validSquadMembers.length > 0) {
      await tx.sprintMember.createMany({
        data: validSquadMembers.map(member => ({
          sprintId: sprint.id,
          userId: member.userId
        }))
      })
    }

    return {
      sprint,
      memberCount: validSquadMembers.length,
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
    createdAt: result.sprint.createdAt.toISOString(),
    warning
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
      squadId: sprint.squadId,
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

/**
 * Gets sprints for all squads managed by a Scrum Master
 * Returns last 3 sprints per squad with active sprint prioritized
 */
export async function getSprintsForScrumMaster(userId: string): Promise<SprintForScrumMaster[]> {
  // Get all squads owned by this Scrum Master
  const ownedSquads = await prisma.squad.findMany({
    where: { scrumMasterId: userId },
    select: { id: true, name: true }
  })

  if (ownedSquads.length === 0) {
    return []
  }

  const squadIds = ownedSquads.map(s => s.id)
  const now = new Date()

  // Get all sprints for owned squads, ordered by start date descending (most recent first)
  const allSprints = await prisma.sprint.findMany({
    where: {
      squadId: { in: squadIds }
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      squadId: true,
      squad: {
        select: { name: true }
      }
    },
    orderBy: { startDate: 'desc' }
  })

  // Group sprints by squad and take only the last 3 per squad
  const sprintsBySquad = new Map<string, typeof allSprints>()

  for (const sprint of allSprints) {
    const squadSprints = sprintsBySquad.get(sprint.squadId) || []
    if (squadSprints.length < 3) {
      squadSprints.push(sprint)
      sprintsBySquad.set(sprint.squadId, squadSprints)
    }
  }

  // Convert to response format with active sprint detection
  const result: SprintForScrumMaster[] = []

  for (const [squadId, sprints] of Array.from(sprintsBySquad.entries())) {
    const squad = ownedSquads.find(s => s.id === squadId)
    if (!squad) continue

    // Sort: active sprint first, then by start date ascending
    const sortedSprints = sprints
      .map(sprint => ({
        ...sprint,
        isActive: now >= sprint.startDate && now <= sprint.endDate
      }))
      .sort((a, b) => {
        // Active sprints first
        if (a.isActive && !b.isActive) return -1
        if (!a.isActive && b.isActive) return 1
        // Then by start date ascending
        return a.startDate.getTime() - b.startDate.getTime()
      })

    for (const sprint of sortedSprints) {
      result.push({
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate.toISOString(),
        endDate: sprint.endDate.toISOString(),
        squadId: sprint.squadId,
        squadName: squad.name,
        isActive: sprint.isActive
      })
    }
  }

  return result
}