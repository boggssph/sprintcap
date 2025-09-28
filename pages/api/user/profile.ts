import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          image: true,
          role: true,
          createdAt: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({ user })
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return res.status(500).json({ error: 'Failed to fetch user profile' })
    }
  }

  if (req.method === 'PUT') {
    const { displayName } = req.body

    if (typeof displayName !== 'string' || displayName.trim().length === 0) {
      return res.status(400).json({ error: 'Display name is required' })
    }

    if (displayName.length > 50) {
      return res.status(400).json({ error: 'Display name must be less than 50 characters' })
    }

    try {
      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { displayName: displayName.trim() },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          image: true,
          role: true,
          createdAt: true
        }
      })

      return res.status(200).json({ user })
    } catch (error) {
      console.error('Failed to update user profile:', error)
      return res.status(500).json({ error: 'Failed to update user profile' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}