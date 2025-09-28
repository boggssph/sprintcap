import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, userEmail } = req.body
  if (!token || !userEmail) return res.status(400).json({ error: 'token and userEmail required' })

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const invite = await prisma.invitation.findFirst({ where: { tokenHash } })
  if (!invite) return res.status(404).json({ error: 'invalid token' })
  if (invite.expiresAt < new Date()) return res.status(410).json({ error: 'expired' })
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) return res.status(403).json({ error: 'email mismatch' })

  try {
    // Create or find user
    const normalizedEmail = userEmail.toLowerCase()
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      user = await prisma.user.create({ 
        data: { 
          email: normalizedEmail, 
          role: invite.invitedRole || 'MEMBER' 
        } 
      })
    }

    // Add user to squad if specified
    if (invite.squadId) {
      await prisma.squadMember.create({ 
        data: { 
          userId: user.id, 
          squadId: invite.squadId 
        } 
      })
    }

    // Mark invitation as accepted
    await prisma.invitation.update({ 
      where: { id: invite.id }, 
      data: { status: 'ACCEPTED' } 
    })

    // Determine redirect URL based on user role
    let redirectUrl = '/'
    if (user.role === 'SCRUM_MASTER' || user.role === 'ADMIN') {
      redirectUrl = '/dashboard/scrum-master'
    } else if (invite.squadId) {
      // For members, redirect to squad dashboard (to be implemented)
      redirectUrl = `/dashboard/member?squad=${invite.squadId}`
    }

    return res.status(200).json({ 
      ok: true, 
      redirectUrl,
      userId: user.id,
      role: user.role 
    })
  } catch (error) {
    console.error('Failed to accept invite:', error)
    return res.status(500).json({ error: 'Failed to accept invitation' })
  }
}
