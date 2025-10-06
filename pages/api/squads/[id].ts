import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return res.status(401).json({ error: 'User not found' })

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing squad id' })

  const squadId = Array.isArray(id) ? id[0] : id

  // Load squad
  const squad = await prisma.squad.findUnique({ where: { id: squadId } })
  if (!squad) return res.status(404).json({ error: 'Squad not found' })

  // Only owner (scrumMasterId) or ADMIN can modify
  if (user.role !== 'ADMIN' && squad.scrumMasterId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'GET') {
    const memberCount = await prisma.squadMember.count({ where: { squadId: squadId } })
    return res.status(200).json({ id: squad.id, alias: squad.alias, name: squad.name, memberCount })
  }

  if (req.method === 'PATCH') {
    try {
      const { alias, name } = req.body || {}

      if (alias !== undefined) {
        if (!/^[A-Z0-9]+$/.test(alias) || alias.length > 10) {
          return res.status(400).json({ error: 'Invalid alias format' })
        }
        const existing = await prisma.squad.findUnique({ where: { alias } })
        if (existing && existing.id !== squad.id) {
          return res.status(400).json({ error: 'Squad alias already exists' })
        }
      }

      const updated = await prisma.squad.update({
        where: { id: squad.id },
        data: {
          ...(alias !== undefined ? { alias } : {}),
          ...(name !== undefined ? { name } : {})
        }
      })

      const memberCount = await prisma.squadMember.count({ where: { squadId: squad.id } })
      return res.status(200).json({ id: updated.id, alias: updated.alias, name: updated.name, memberCount })
    } catch (error) {
      console.error('Failed to update squad:', error)
      return res.status(500).json({ error: 'Failed to update squad' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.squad.delete({ where: { id: squad.id } })
      return res.status(204).end()
    } catch (error) {
      console.error('Failed to delete squad:', error)
      return res.status(500).json({ error: 'Failed to delete squad' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
