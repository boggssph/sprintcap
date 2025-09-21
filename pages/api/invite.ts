import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, squadId } = req.body
  if (!email) return res.status(400).json({ error: 'email required' })

  const token = crypto.randomBytes(24).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invite = await prisma.invitation.create({
    data: { email, squadId, tokenHash, expiresAt }
  })

  // Here you'd call Brevo to send the email with the accept link containing `token`

  return res.status(201).json({ id: invite.id })
}
