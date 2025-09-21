import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, name, makeScrumMaster } = req.body
  if (!email) return res.status(400).json({ error: 'email required' })

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, role: makeScrumMaster ? 'SCRUM_MASTER' : 'MEMBER' }
  })

  return res.status(201).json({ user })
}
