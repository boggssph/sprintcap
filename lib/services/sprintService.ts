/**
 * Sprint Service - Business logic for sprint management
 */

import { prisma } from '../prisma'
import { validateCreateSprintRequest, validateSprintDates, CreateSprintRequest } from '../validations/sprint'
import type { Sprint } from '@prisma/client'
import { calculateCeremonyTime, DEFAULT_CEREMONY_VALUES } from './ceremonyCalculations'

type SquadWithCeremonyFields = {
  id: string
  name: string
  alias: string
  scrumMasterId: string
  dailyScrumMinutes: number
  refinementHours: number
  reviewDemoMinutes: number
  planningHours: number
  retrospectiveMinutes: number
}

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
  ceremonyBreakdown?: {
    dailyScrumTotal: number
    refinementTotal: number
    reviewDemoTotal: number
    planningTotal: number
    retrospectiveTotal: number
    totalCeremonyHours: number
  }
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
  squadId: string
  squadName: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  memberCount: number
  createdAt: string
  isActive: boolean
  isEnabledForCapacity?: boolean
  dailyScrum?: number
  sprintPlanning?: number
  sprintReview?: number
  sprintRetrospective?: number
}

export interface SprintStatusUpdate {
  id: string
  oldStatus: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  newStatus: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

export interface SprintForScrumMaster {
  id: string
  name: string
  startDate: string
  endDate: string
  squadId: string
  squadName: string
  isActive: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  dailyScrum?: number
  sprintPlanning?: number
  sprintReview?: number
  sprintRetrospective?: number
  refinement?: number
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

  console.log('Checking squad exists and user owns it...')
  // Verify squad exists and user owns it
  const squad = await prisma.squad.findUnique({
    where: { id: data.squadId },
    select: {
      id: true,
      name: true,
      alias: true,
      scrumMasterId: true,
      dailyScrumMinutes: true,
      refinementHours: true,
      reviewDemoMinutes: true,
      planningHours: true,
      retrospectiveMinutes: true
    }
  }) as SquadWithCeremonyFields | null

  if (!squad) {
    console.log('Squad not found:', data.squadId)
    throw new SprintServiceError('Squad not found', 'NOT_FOUND')
  }

  if (squad.scrumMasterId !== userId) {
    console.log('Access denied - user does not own squad:', { userId, squadScrumMasterId: squad.scrumMasterId })
    throw new SprintServiceError('Access denied: You do not own this squad', 'PERMISSION_DENIED')
  }

  console.log('Checking for duplicate sprint name...')
  // Check for duplicate sprint name within the squad (normalize to spec format)
  const expectedName = data.name.trim();
  const existingSprint = await prisma.sprint.findFirst({
    where: {
      squadId: data.squadId,
      name: expectedName
    }
  })

  if (existingSprint) {
    console.log('Duplicate sprint name found:', expectedName)
    throw new SprintServiceError(
      `A sprint with the name '${expectedName}' already exists in this squad`,
      'CONFLICT'
    )
  }

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)

  console.log('Validating dates:', { startDate, endDate })
  // Validate business rules for dates
  const dateErrors = validateSprintDates(startDate, endDate)
  if (dateErrors.length > 0) {
    throw new SprintServiceError(
      `Date validation failed: ${dateErrors.map(e => e.message).join(', ')}`,
      'VALIDATION_ERROR'
    )
  }

  console.log('Checking for overlapping sprints...')
  // Check for overlapping sprints using a simpler approach
  const overlappingSprint = await prisma.$queryRaw`
    SELECT id, name FROM "Sprint"
    WHERE "squadId" = ${data.squadId}
    AND (
      ("startDate" < ${endDate} AND "endDate" > ${startDate})
    )
    LIMIT 1
  ` as { id: string; name: string }[]

  if (overlappingSprint.length > 0) {
    console.log('Overlapping sprint found:', overlappingSprint[0].name)
    throw new SprintServiceError(
      `Sprint dates overlap with existing sprint '${overlappingSprint[0].name}'`,
      'CONFLICT'
    )
  }

  console.log('Getting squad members...')
  // Get active squad members for automatic population
  const squadMembers = await prisma.squadMember.findMany({
    where: { squadId: data.squadId },
    select: { userId: true }
  })

  console.log('Squad members found:', squadMembers.length)

  // Calculate ceremony times using squad defaults
  console.log('Calculating ceremony times...')
  const ceremonyDefaults = {
    dailyScrumMinutes: squad.dailyScrumMinutes ?? DEFAULT_CEREMONY_VALUES.dailyScrumMinutes,
    refinementHours: squad.refinementHours ?? DEFAULT_CEREMONY_VALUES.refinementHours,
    reviewDemoMinutes: squad.reviewDemoMinutes ?? DEFAULT_CEREMONY_VALUES.reviewDemoMinutes,
    planningHours: squad.planningHours ?? DEFAULT_CEREMONY_VALUES.planningHours,
    retrospectiveMinutes: squad.retrospectiveMinutes ?? DEFAULT_CEREMONY_VALUES.retrospectiveMinutes
  }

  const ceremonyCalculation = calculateCeremonyTime(ceremonyDefaults, startDate, endDate)
  console.log('Ceremony calculation:', ceremonyCalculation)

  // Validate that all userIds exist (avoid orphaned records)
  let validSquadMembers: { userId: string }[] = []
  if (squadMembers.length > 0) {
    const userIds = squadMembers.map(m => m.userId)
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true }
    })
    const existingUserIds = new Set(existingUsers.map(u => u.id))
    validSquadMembers = squadMembers.filter(m => existingUserIds.has(m.userId))
    console.log('Valid squad members after user validation:', validSquadMembers.length)
  }

  // If no members, set a warning to be returned in the API response
  let warning: string | undefined = undefined;
  if (validSquadMembers.length === 0) {
    warning = 'Sprint created with no members. Add members manually if needed.';
  }

  console.log('Creating sprint in transaction...')
  // Create sprint in transaction
  const result = await prisma.$transaction(async (tx) => {
    try {
      console.log('Creating sprint...')
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

      console.log('Sprint created:', sprint.id)
      // Create sprint members for all active squad members
      if (validSquadMembers.length > 0) {
        console.log('Creating sprint members for users:', validSquadMembers.map(m => m.userId))
        await tx.sprintMember.createMany({
          data: validSquadMembers.map(member => ({
            sprintId: sprint.id,
            userId: member.userId
          }))
        })
        console.log('Sprint members created')
      }

      return {
        sprint,
        memberCount: validSquadMembers.length,
        squadName: squad.name
      }
    } catch (error) {
      console.error('Error in transaction:', error)
      throw error
    }
  })

  console.log('Sprint creation completed successfully')
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
    warning,
    ceremonyBreakdown: {
      dailyScrumTotal: ceremonyCalculation.dailyScrumTotal,
      refinementTotal: ceremonyCalculation.refinementTotal,
      reviewDemoTotal: ceremonyCalculation.reviewDemoTotal,
      planningTotal: ceremonyCalculation.planningTotal,
      retrospectiveTotal: ceremonyCalculation.retrospectiveTotal,
      totalCeremonyHours: ceremonyCalculation.totalCeremonyHours
    }
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
      isActive: true,
      createdAt: true,
      squadId: true,
      dailyScrumMinutes: true,
      sprintPlanningMinutes: true,
      sprintReviewMinutes: true,
      sprintRetrospectiveMinutes: true,
      refinementMinutes: true,
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
      status: sprint.status as 'ACTIVE' | 'INACTIVE' | 'COMPLETED',
      createdAt: sprint.createdAt.toISOString(),
      isActive: sprint.startDate <= new Date() && sprint.endDate >= new Date(),
      dailyScrum: sprint.dailyScrumMinutes,
      sprintPlanning: sprint.sprintPlanningMinutes,
      sprintReview: sprint.sprintReviewMinutes,
      sprintRetrospective: sprint.sprintRetrospectiveMinutes,
      refinement: sprint.refinementMinutes
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
      status: true,
      isActive: true,
      squadId: true,
      dailyScrumMinutes: true,
      sprintPlanningMinutes: true,
      sprintReviewMinutes: true,
      sprintRetrospectiveMinutes: true,
      refinementMinutes: true,
      squad: {
        select: { name: true }
      }
    },
    orderBy: { startDate: 'desc' }
  })

  // Auto-update statuses for all sprints
  const statusUpdates: SprintStatusUpdate[] = []
  for (const sprint of allSprints) {
    let newStatus = sprint.status

    if (sprint.status === 'INACTIVE' && now >= sprint.startDate && now <= sprint.endDate) {
      newStatus = 'ACTIVE'
    } else if (sprint.status === 'ACTIVE' && now > sprint.endDate) {
      newStatus = 'COMPLETED'
    }

    if (newStatus !== sprint.status) {
      statusUpdates.push({
        id: sprint.id,
        oldStatus: sprint.status,
        newStatus
      })
    }
  }

  // Apply status updates in batch
  if (statusUpdates.length > 0) {
    for (const update of statusUpdates) {
      await prisma.sprint.update({
        where: { id: update.id },
        data: { status: update.newStatus }
      })
    }
  }

  // Group sprints by squad and take only the last 3 per squad
  const sprintsBySquad = new Map<string, typeof allSprints>()

  for (const sprint of allSprints) {
    const squadSprints = sprintsBySquad.get(sprint.squadId) || []
    if (squadSprints.length < 3) {
      squadSprints.push(sprint)
      sprintsBySquad.set(sprint.squadId, squadSprints)
    }
  }

  // Convert to response format with updated statuses
  const result: SprintForScrumMaster[] = []

  for (const [squadId, sprints] of Array.from(sprintsBySquad.entries())) {
    const squad = ownedSquads.find(s => s.id === squadId)
    if (!squad) continue

    // Sort: active sprint first, then by start date ascending
    const sortedSprints = sprints
      .map(sprint => {
        // Use updated status if it was changed
        const statusUpdate = statusUpdates.find(u => u.id === sprint.id)
        const currentStatus = statusUpdate ? statusUpdate.newStatus : sprint.status

        return {
          ...sprint,
          status: currentStatus,
          isActive: now >= sprint.startDate && now <= sprint.endDate
        }
      })
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
        isActive: sprint.isActive,
        status: sprint.status,
        dailyScrum: sprint.dailyScrumMinutes,
        sprintPlanning: sprint.sprintPlanningMinutes,
        sprintReview: sprint.sprintReviewMinutes,
        sprintRetrospective: sprint.sprintRetrospectiveMinutes,
        refinement: sprint.refinementMinutes
      })
    }
  }

  return result
}

/**
 * Automatically update sprint statuses based on current date
 */
export async function updateSprintStatuses(): Promise<SprintStatusUpdate[]> {
  const now = new Date()
  const updates: SprintStatusUpdate[] = []

  // Find sprints that should be ACTIVE (current date is within sprint range)
  const sprintsToActivate = await prisma.sprint.findMany({
    where: {
      status: 'INACTIVE',
      startDate: { lte: now },
      endDate: { gte: now }
    },
    select: { id: true, status: true }
  })

  // Find sprints that should be COMPLETED (current date is past end date)
  const sprintsToComplete = await prisma.sprint.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now }
    },
    select: { id: true, status: true }
  })

  // Update INACTIVE → ACTIVE
  if (sprintsToActivate.length > 0) {
    await prisma.sprint.updateMany({
      where: {
        id: { in: sprintsToActivate.map(s => s.id) }
      },
      data: { status: 'ACTIVE' }
    })

    updates.push(...sprintsToActivate.map(sprint => ({
      id: sprint.id,
      oldStatus: sprint.status as 'ACTIVE' | 'INACTIVE' | 'COMPLETED',
      newStatus: 'ACTIVE' as const
    })))
  }

  // Update ACTIVE → COMPLETED
  if (sprintsToComplete.length > 0) {
    await prisma.sprint.updateMany({
      where: {
        id: { in: sprintsToComplete.map(s => s.id) }
      },
      data: { status: 'COMPLETED' }
    })

    updates.push(...sprintsToComplete.map(sprint => ({
      id: sprint.id,
      oldStatus: sprint.status as 'ACTIVE' | 'INACTIVE' | 'COMPLETED',
      newStatus: 'COMPLETED' as const
    })))
  }

  return updates
}

/**
 * Manually update sprint status (for Scrum Masters)
 */
export async function updateSprintStatus(
  sprintId: string,
  newStatus: 'ACTIVE' | 'INACTIVE' | 'COMPLETED',
  userId: string
): Promise<Sprint> {
  // Verify user is Scrum Master of the sprint's squad
  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      squad: { scrumMasterId: userId }
    }
  })

  if (!sprint) {
    throw new Error('Sprint not found or user is not the Scrum Master')
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    'INACTIVE': ['ACTIVE'],
    'ACTIVE': ['COMPLETED'],
    'COMPLETED': [] // Terminal state
  }

  if (!validTransitions[sprint.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${sprint.status} to ${newStatus}`)
  }

  return prisma.sprint.update({
    where: { id: sprintId },
    data: { status: newStatus }
  })
}

/**
 * Get sprint with current status (auto-updated if needed)
 */
export async function getSprintWithCurrentStatus(sprintId: string): Promise<Sprint | null> {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId }
  })

  if (!sprint) return null

  // Auto-update status if needed
  const now = new Date()
  let updatedStatus = sprint.status

  if (sprint.status === 'INACTIVE' && now >= sprint.startDate && now <= sprint.endDate) {
    updatedStatus = 'ACTIVE'
  } else if (sprint.status === 'ACTIVE' && now > sprint.endDate) {
    updatedStatus = 'COMPLETED'
  }

  // Update in database if status changed
  if (updatedStatus !== sprint.status) {
    await prisma.sprint.update({
      where: { id: sprintId },
      data: { status: updatedStatus }
    })
  }

  return { ...sprint, status: updatedStatus }
}

/**
 * Update a sprint with validation
 */
export async function updateSprint(
  sprintId: string,
  updateData: {
    name: string
    startDate: Date
    endDate: Date
    status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
    dailyScrum?: number
    sprintPlanning?: number
    sprintReview?: number
    sprintRetrospective?: number
    refinement?: number
  },
  scrumMasterId: string
): Promise<Sprint | null> {
  // Verify the sprint exists and belongs to the scrum master
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: {
      squad: {
        select: { scrumMasterId: true }
      }
    }
  })

  if (!sprint) return null

  // Verify ownership
  if (sprint.squad.scrumMasterId !== scrumMasterId) {
    throw new Error('Unauthorized: Sprint does not belong to this Scrum Master')
  }

  // Validate status transition if provided
  if (updateData.status && updateData.status !== sprint.status) {
    const validTransitions: Record<string, string[]> = {
      'INACTIVE': ['ACTIVE'],
      'ACTIVE': ['COMPLETED'],
      'COMPLETED': []
    }

    if (!validTransitions[sprint.status]?.includes(updateData.status)) {
      throw new Error(`Invalid status transition from ${sprint.status} to ${updateData.status}`)
    }
  }

  // Update the sprint
  return await prisma.sprint.update({
    where: { id: sprintId },
    data: {
      name: updateData.name,
      startDate: updateData.startDate,
      endDate: updateData.endDate,
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.dailyScrum !== undefined && { dailyScrumMinutes: updateData.dailyScrum }),
      ...(updateData.sprintPlanning !== undefined && { sprintPlanningMinutes: updateData.sprintPlanning }),
      ...(updateData.sprintReview !== undefined && { sprintReviewMinutes: updateData.sprintReview }),
      ...(updateData.sprintRetrospective !== undefined && { sprintRetrospectiveMinutes: updateData.sprintRetrospective }),
      ...(updateData.refinement !== undefined && { refinementMinutes: updateData.refinement }),
      updatedAt: new Date()
    }
  })
}