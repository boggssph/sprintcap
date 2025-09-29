import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { createSprint, listSprints } from '../../lib/services/sprintService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET for listing sprints and POST for creating sprints
  if (req.method === 'GET') {
    return handleGet(req, res)
  }

  if (req.method === 'POST') {
    return handlePost(req, res)
  }

  return res.status(405).end()
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get authenticated user
    let session: any = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = { user: { id: 'test-user-id', email: testUser.toLowerCase(), name: testUser } }
      }
    }
    if (!session) session = await getServerSession(req, res, authOptions as any)
    if (!session || !session.user?.email) return res.status(401).json({ error: 'unauthenticated' })

    // For now, assume user role - in real implementation, get from database
    // This would need to be enhanced to get the actual user role from the database
    const userRole = 'SCRUM_MASTER' // Placeholder - should be fetched from DB

    // Extract query parameters
    const { squadId, status, limit, offset } = req.query

    const filters = {
      squadId: squadId as string | undefined,
      status: status as ('active' | 'upcoming' | 'completed') | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined
    }

    const result = await listSprints(session.user.id, userRole, filters)
    return res.status(200).json(result)

  } catch (error: any) {
    console.error('Error listing sprints:', error)
    return res.status(error.code === 'PERMISSION_DENIED' ? 403 :
                     error.code === 'NOT_FOUND' ? 404 : 500)
           .json({ error: error.message })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get authenticated user
    let session: any = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = { user: { id: 'test-user-id', email: testUser.toLowerCase(), name: testUser } }
      }
    }
    if (!session) session = await getServerSession(req, res, authOptions as any)
    if (!session || !session.user?.email) return res.status(401).json({ error: 'unauthenticated' })

    // For now, assume user role - in real implementation, get from database
    const userRole = 'SCRUM_MASTER' // Placeholder - should be fetched from DB

    const body = req.body || {}

    // Basic validation
    if (!body.name || !body.squadId || !body.startDate || !body.endDate) {
      return res.status(400).json({ error: 'Missing required fields: name, squadId, startDate, endDate' })
    }

    const result = await createSprint(session.user.id, userRole, {
      name: body.name,
      squadId: body.squadId,
      startDate: body.startDate,
      endDate: body.endDate
    })

    return res.status(201).json(result)

  } catch (error: any) {
    console.error('Error creating sprint:', error)

    // Map service errors to HTTP status codes
    const statusCode = error.code === 'VALIDATION_ERROR' ? 400 :
                      error.code === 'PERMISSION_DENIED' ? 403 :
                      error.code === 'NOT_FOUND' ? 404 :
                      error.code === 'CONFLICT' ? 409 : 500

    return res.status(statusCode).json({ error: error.message })
  }
}