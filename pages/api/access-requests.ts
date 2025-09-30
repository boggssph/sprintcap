import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient, AccessRequestStatus } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user || typeof session.user !== 'object' || !('role' in session.user) || (session.user as { role?: string }).role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const requests = await prisma.accessRequest.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return res.status(200).json({ requests })
    } catch (error) {
      console.error('Failed to fetch access requests:', error)
      return res.status(500).json({ error: 'Failed to fetch access requests' })
    }
  }

  if (req.method === 'POST') {
    const { requestId, action } = req.body

    if (!requestId || !action || !['approve', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    try {
      const request = await prisma.accessRequest.findUnique({
        where: { id: requestId }
      })

      if (!request) {
        return res.status(404).json({ error: 'Access request not found' })
      }

      if (action === 'approve') {
        // Create user with the requested role
        await prisma.user.create({
          data: {
            email: request.email,
            name: request.name,
            image: request.image,
            role: request.requestedRole,
            providerId: request.providerId
          }
        })

        // Update request status
        await prisma.accessRequest.update({
          where: { id: requestId },
          data: { status: AccessRequestStatus.APPROVED }
        })
      } else {
        // Decline the request
        await prisma.accessRequest.update({
          where: { id: requestId },
          data: { status: AccessRequestStatus.DECLINED }
        })
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Failed to process access request:', error)
      return res.status(500).json({ error: 'Failed to process access request' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}