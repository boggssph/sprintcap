import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Get the user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }

  if (req.method === 'GET') {
    try {
      // Get squads for the current Scrum Master
      const squads = await prisma.squad.findMany({
        where: { scrumMasterId: user.id },
        include: {
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const formattedSquads = squads.map(squad => ({
        id: squad.id,
        alias: squad.alias,
        name: squad.name,
        memberCount: squad._count.members
      }))

      return res.status(200).json({ squads: formattedSquads })
    } catch (error) {
      console.error('Failed to fetch squads:', error)
      return res.status(500).json({ error: 'Failed to fetch squads' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { alias, name } = req.body

      if (!alias || !name) {
        return res.status(400).json({ error: 'Alias and name are required' })
      }

      // Validate alias format
      if (!/^[A-Z0-9]+$/.test(alias) || alias.length > 10) {
        return res.status(400).json({ error: 'Invalid alias format' })
      }

      // Check if alias already exists
      const existingSquad = await prisma.squad.findUnique({
        where: { alias }
      })

      if (existingSquad) {
        return res.status(400).json({ error: 'Squad alias already exists' })
      }

      // Create the squad
      const squad = await prisma.squad.create({
        data: {
          alias,
          name,
          scrumMasterId: user.id
        }
      })

      return res.status(201).json(squad)
    } catch (error) {
      console.error('Failed to create squad:', error)
      return res.status(500).json({ error: 'Failed to create squad' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}