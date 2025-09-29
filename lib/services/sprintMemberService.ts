/**
 * SprintMember Service - Business logic for sprint member management
 */

import { prisma } from '../prisma'

export interface SprintMemberData {
  id: string
  sprintId: string
  userId: string
  createdAt: string
}

export class SprintMemberServiceError extends Error {
  constructor(message: string, public code: string = 'SPRINT_MEMBER_ERROR') {
    super(message)
    this.name = 'SprintMemberServiceError'
  }
}

/**
 * Gets all members of a sprint
 */
export async function getSprintMembers(sprintId: string): Promise<SprintMemberData[]> {
  const members = await prisma.sprintMember.findMany({
    where: { sprintId },
    include: {
      user: {
        select: {
          displayName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return members.map(member => ({
    id: member.id,
    sprintId: member.sprintId,
    userId: member.userId,
    createdAt: member.createdAt.toISOString()
  }))
}

/**
 * Adds a user to a sprint (if they are a member of the squad)
 */
export async function addSprintMember(
  sprintId: string,
  userId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<SprintMemberData> {
  // Verify requesting user has permission
  if (requestingUserRole !== 'SCRUM_MASTER') {
    throw new SprintMemberServiceError('Only Scrum Masters can manage sprint members', 'PERMISSION_DENIED')
  }

  // Get sprint and verify ownership
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { squad: true }
  })

  if (!sprint) {
    throw new SprintMemberServiceError('Sprint not found', 'NOT_FOUND')
  }

  if (sprint.squad.scrumMasterId !== requestingUserId) {
    throw new SprintMemberServiceError('Access denied: You do not own this sprint\'s squad', 'PERMISSION_DENIED')
  }

  // Verify user is a member of the squad
  const squadMember = await prisma.squadMember.findFirst({
    where: {
      squadId: sprint.squadId,
      userId: userId
    }
  })

  if (!squadMember) {
    throw new SprintMemberServiceError('User is not a member of this sprint\'s squad', 'VALIDATION_ERROR')
  }

  // Check if user is already in the sprint
  const existingMember = await prisma.sprintMember.findFirst({
    where: {
      sprintId,
      userId
    }
  })

  if (existingMember) {
    throw new SprintMemberServiceError('User is already a member of this sprint', 'CONFLICT')
  }

  // Add user to sprint
  const member = await prisma.sprintMember.create({
    data: {
      sprintId,
      userId
    }
  })

  return {
    id: member.id,
    sprintId: member.sprintId,
    userId: member.userId,
    createdAt: member.createdAt.toISOString()
  }
}

/**
 * Removes a user from a sprint
 */
export async function removeSprintMember(
  sprintId: string,
  userId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<void> {
  // Verify requesting user has permission
  if (requestingUserRole !== 'SCRUM_MASTER') {
    throw new SprintMemberServiceError('Only Scrum Masters can manage sprint members', 'PERMISSION_DENIED')
  }

  // Get sprint and verify ownership
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { squad: true }
  })

  if (!sprint) {
    throw new SprintMemberServiceError('Sprint not found', 'NOT_FOUND')
  }

  if (sprint.squad.scrumMasterId !== requestingUserId) {
    throw new SprintMemberServiceError('Access denied: You do not own this sprint\'s squad', 'PERMISSION_DENIED')
  }

  // Remove user from sprint
  const result = await prisma.sprintMember.deleteMany({
    where: {
      sprintId,
      userId
    }
  })

  if (result.count === 0) {
    throw new SprintMemberServiceError('User is not a member of this sprint', 'NOT_FOUND')
  }
}

/**
 * Gets member count for a sprint
 */
export async function getSprintMemberCount(sprintId: string): Promise<number> {
  const count = await prisma.sprintMember.count({
    where: { sprintId }
  })

  return count
}