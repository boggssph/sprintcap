import { prisma } from './prisma'
import { hashToken, generateToken } from './tokenUtils'

export async function listInvites(actorEmail: string, opts: { limit?: number, cursor?: string | null, status?: string | undefined, q?: string | undefined }) {
  const actor = await prisma.user.findUnique({ where: { email: actorEmail.toLowerCase() } })
  if (!actor) throw new Error('forbidden')

  const limit = Math.min(50, opts.limit || 20)
  const where: Record<string, unknown> = {}
  if (opts.status) where.status = opts.status
  if (opts.q) where.email = { contains: opts.q, mode: 'insensitive' }

  // Filter invites based on user role
  if (actor.role === 'MEMBER') {
    // Members cannot see any invites
    return { invites: [], nextCursor: null }
  }
  if (actor.role !== 'ADMIN') {
    if (actor.role === 'SCRUM_MASTER') {
      // Scrum Masters see invites for squads they manage
      const managedSquadIds = await prisma.squad.findMany({
        where: { scrumMasterId: actor.id },
        select: { id: true }
      }).then(squads => squads.map(s => s.id))

      where.OR = [
        { createdById: actor.id }, // Invites they created
        { squadId: { in: managedSquadIds } } // Invites for squads they manage
      ]
    }
  }

  const invites = await prisma.invitation.findMany({
    where,
    include: {
      squad: {
        select: {
          name: true,
          alias: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {})
  })

  let nextCursor: string | null = null
  if (invites.length > limit) {
    const next = invites.pop()!
    nextCursor = next.id
  }
  return { invites, nextCursor }
}

export async function createInvite(actorEmail: string, params: { email: string, squadId?: string | null, role?: string }) {
  const actor = await prisma.user.findUnique({ where: { email: actorEmail.toLowerCase() } })
  if (!actor) throw new Error('forbidden')

  // Only ADMIN and SCRUM_MASTER can create invites
  if (actor.role === 'MEMBER') {
    throw new Error('only ADMIN and SCRUM_MASTER can create invites')
  }

  // Validate that invited email is a Gmail address
  if (!params.email.toLowerCase().endsWith('@gmail.com')) {
    throw new Error('invitations are restricted to Gmail addresses only')
  }

  const desiredRole = (params.role || 'MEMBER')
  const allowedRoles = ['MEMBER', 'SCRUM_MASTER', 'ADMIN']
  if (!allowedRoles.includes(desiredRole)) throw new Error('invalid role')
  if (desiredRole === 'ADMIN' && typeof actor === 'object' && 'role' in actor && actor.role !== 'ADMIN') {
    throw new Error('only ADMIN can invite ADMIN')
  }
  if (desiredRole === 'SCRUM_MASTER' && typeof actor === 'object' && 'role' in actor && !['ADMIN', 'SCRUM_MASTER'].includes(actor.role)) {
    throw new Error('only ADMIN or SCRUM_MASTER can invite SCRUM_MASTER')
  }

  const token = generateToken()
  const tokenHash = hashToken(token)
  // Default TTL: 72 hours
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)

  const invite = await prisma.invitation.create({ data: { email: params.email.toLowerCase(), squadId: params.squadId, createdById: actor.id, tokenHash, expiresAt, invitedRole: desiredRole as 'MEMBER' | 'SCRUM_MASTER' | 'ADMIN' } })

  try {
    await prisma.auditLog.create({ data: { actorId: actor.id, action: 'CREATE_INVITE', meta: { inviteId: invite.id, email: params.email, squadId: params.squadId, role: desiredRole } } })
  } catch (e) {
    console.warn('Failed to write audit log', e)
  }

  // notify via brevo if configured
  try {
    const brevoKey = process.env.BREVO_API_KEY
    if (brevoKey) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
      const acceptUrl = `${baseUrl}/accept-invite?token=${token}&email=${encodeURIComponent(params.email)}`
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
        body: JSON.stringify({
          sender: { name: 'SprintCap', email: 'ftseguerra@gmail.com' },
          to: [{ email: params.email }],
          subject: 'You\'ve been invited to SprintCap',
          htmlContent: `<p>You've been invited to join SprintCap as a ${desiredRole.toLowerCase()}.</p><p><a href="${acceptUrl}">Click here to accept your invitation</a></p><p>This invitation expires in 72 hours.</p>`
        })
      })
    }
  } catch (e) {
    console.warn('Failed to send invite email', e)
  }

  return { id: invite.id, token }
}

export async function regenerateInvite(actorEmail: string, inviteId: string) {
  const actor = await prisma.user.findUnique({ where: { email: actorEmail.toLowerCase() } })
  if (!actor) throw new Error('forbidden')
  
  // Check if the invite exists and get its role
  const existing = await prisma.invitation.findUnique({ where: { id: inviteId } })
  if (!existing) throw new Error('invite not found')
  
  // Only ADMIN can regenerate ADMIN invites, but ADMIN or SCRUM_MASTER can regenerate SCRUM_MASTER invites
  if (existing.invitedRole === 'ADMIN' && actor.role !== 'ADMIN') {
    throw new Error('only ADMIN can regenerate ADMIN invites')
  }
  if (existing.invitedRole === 'SCRUM_MASTER' && !['ADMIN', 'SCRUM_MASTER'].includes(actor.role)) {
    throw new Error('only ADMIN or SCRUM_MASTER can regenerate SCRUM_MASTER invites')
  }

  // Expire the existing invite and create a new invite record with a fresh token
  await prisma.invitation.update({ where: { id: inviteId }, data: { status: 'EXPIRED' } })

  const newToken = generateToken()
  const newTokenHash = hashToken(newToken)
  const newExpires = new Date(Date.now() + 72 * 60 * 60 * 1000)
  const created = await prisma.invitation.create({ data: { email: existing.email, squadId: existing.squadId, createdById: existing.createdById, tokenHash: newTokenHash, expiresAt: newExpires, invitedRole: existing.invitedRole } })
  try {
    await prisma.auditLog.create({ data: { actorId: actor.id, action: 'REGENERATE_INVITE', meta: { inviteId } } })
  } catch (e) {
    console.warn('Failed to write audit log', e)
  }
  return { id: created.id, token: newToken }
}

export async function acceptInvite(token: string, email: string) {
  const tokenHash = hashToken(token)
  const now = new Date()
  const invite = await prisma.invitation.findFirst({ where: { tokenHash, status: 'PENDING', expiresAt: { gt: now } } })
  if (!invite) throw new Error('invalid or expired token')

  // Create or link user
  const normalizedEmail = email.toLowerCase()
  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user) {
    user = await prisma.user.create({ data: { email: normalizedEmail, role: 'MEMBER' } })
  }

  // Attach to squad if present
  try {
    if (invite.squadId) {
      await prisma.squadMember.create({ data: { userId: user.id, squadId: invite.squadId } })
    }
    await prisma.invitation.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } })
    await prisma.auditLog.create({ data: { actorId: user.id, action: 'ACCEPT_INVITE', meta: { inviteId: invite.id, email: normalizedEmail } } })
  } catch (e) {
    console.warn('Failed to finalize invite acceptance', e)
  }

  return { success: true, userId: user.id }
}

export async function revokeInvite(actorEmail: string, inviteId: string) {
  const actor = await prisma.user.findUnique({ where: { email: actorEmail.toLowerCase() } })
  if (!actor) throw new Error('forbidden')
  
  // Check if the invite exists and get its role
  const existing = await prisma.invitation.findUnique({ where: { id: inviteId } })
  if (!existing) throw new Error('invite not found')
  
  // Only ADMIN can revoke ADMIN invites, but ADMIN or SCRUM_MASTER can revoke SCRUM_MASTER invites
  if (existing.invitedRole === 'ADMIN' && actor.role !== 'ADMIN') {
    throw new Error('only ADMIN can revoke ADMIN invites')
  }
  if (existing.invitedRole === 'SCRUM_MASTER' && !['ADMIN', 'SCRUM_MASTER'].includes(actor.role)) {
    throw new Error('only ADMIN or SCRUM_MASTER can revoke SCRUM_MASTER invites')
  }
  
  const updated = await prisma.invitation.update({ where: { id: inviteId }, data: { status: 'EXPIRED' } })
  try {
    await prisma.auditLog.create({ data: { actorId: actor.id, action: 'REVOKE_INVITE', meta: { inviteId } } })
  } catch (e) {
    console.warn('Failed to write audit log', e)
  }

  // notify via brevo if configured
  try {
    const brevoKey = process.env.BREVO_API_KEY
    if (brevoKey) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': brevoKey },
        body: JSON.stringify({ sender: { name: 'SprintCap', email: 'ftseguerra@gmail.com' }, to: [{ email: updated.email }], subject: 'Your invite has been revoked', htmlContent: `<p>Your invitation to SprintCap has been revoked by an administrator.</p>` })
      })
    }
  } catch (e) {
    console.warn('Failed to send revoke email', e)
  }

  return { id: updated.id }
}
