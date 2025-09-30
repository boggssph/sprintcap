import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, name, image, providerId, requestedRole } = req.body

  if (!email || !requestedRole) {
    return res.status(400).json({ error: 'Email and requested role are required' })
  }

  // Validate role
  const validRoles = ['SCRUM_MASTER', 'MEMBER']
  if (!validRoles.includes(requestedRole)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  try {
    // Check for rate limiting: 1 request per day or until existing request is declined
    const existingRequest = await prisma.accessRequest.findFirst({
      where: {
        email: email.toLowerCase(),
        OR: [
          { status: 'PENDING' },
          {
            status: 'DECLINED',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
            }
          }
        ]
      }
    })

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return res.status(429).json({
          error: 'You already have a pending access request. Please wait for admin approval.'
        })
      } else if (existingRequest.status === 'DECLINED') {
        return res.status(429).json({
          error: 'Your previous request was declined. You can submit a new request in 24 hours.'
        })
      }
    }

    // Create the access request
    const accessRequest = await prisma.accessRequest.create({
      data: {
        email: email.toLowerCase(),
        name,
        image,
        providerId,
        requestedRole: requestedRole as 'SCRUM_MASTER' | 'MEMBER',
      }
    })

    return res.status(201).json({
      message: 'Access request submitted successfully',
      requestId: accessRequest.id
    })

  } catch (error) {
    console.error('Error creating access request:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}