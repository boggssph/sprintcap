import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = session.user
    if (typeof user !== 'object' || !('role' in user) || (user as { role?: string }).role !== 'SCRUM_MASTER' && (user as { role?: string }).role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Get all squad members for squads owned by this Scrum Master
    const squadMembers = await prisma.squadMember.findMany({
      where: {
        squad: {
          scrumMasterId: typeof user === 'object' && 'id' in user ? (user as { id: string }).id : ''
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            displayName: true,
            image: true
          }
        },
        squad: {
          select: {
            id: true,
            name: true,
            alias: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const members = squadMembers.map(member => ({
      id: member.user.id,
      displayName: member.user.displayName || member.user.name || member.user.email,
      email: member.user.email,
      squadName: member.squad.name,
      squadAlias: member.squad.alias,
      dateJoined: member.createdAt,
      avatar: member.user.image
    }))

    res.status(200).json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}