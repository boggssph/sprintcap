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

  // mark accepted and optionally add user to squad; actual user creation is handled by auth flow
  await prisma.invitation.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } })

  return res.status(200).json({ ok: true })
}
