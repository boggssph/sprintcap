import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { createSprint, listSprints } from '../../lib/services/sprintService'
import { prisma } from '../../lib/prisma'

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
      let session: unknown = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = { user: { id: 'test-user-id', email: testUser.toLowerCase(), name: testUser } }
      }
    }
      if (!session) session = await getServerSession(req, res, authOptions)
      if (!session || typeof session !== 'object' || !('user' in session) || !session.user || typeof session.user !== 'object' || !('email' in session.user) || typeof session.user.email !== 'string') return res.status(401).json({ error: 'unauthenticated' })

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Extract query parameters
    const { squadId, status, limit, offset } = req.query

    const filters = {
      squadId: squadId as string | undefined,
      status: status as ('active' | 'upcoming' | 'completed') | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined
    }

      const result = await listSprints(user.id, user.role, filters)
    return res.status(200).json(result)

  } catch (error: unknown) {
    console.error('Error listing sprints:', error)
      const statusCode = typeof error === 'object' && error !== null && 'code' in error
        ? ((error as { code?: string }).code === 'PERMISSION_DENIED' ? 403 :
           (error as { code?: string }).code === 'NOT_FOUND' ? 404 : 500)
        : 500
      return res.status(statusCode).json({ error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : String(error) })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get authenticated user
      let session: unknown = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = { user: { id: 'test-user-id', email: testUser.toLowerCase(), name: testUser } }
      }
    }
      if (!session) session = await getServerSession(req, res, authOptions)
      if (!session || typeof session !== 'object' || !('user' in session) || !session.user || typeof session.user !== 'object' || !('email' in session.user) || typeof session.user.email !== 'string') return res.status(401).json({ error: 'unauthenticated' })

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    const body = req.body || {}

    // Basic validation
    if (!body.name || !body.squadId || !body.startDate || !body.endDate) {
      return res.status(400).json({ error: 'Missing required fields: name, squadId, startDate, endDate' })
    }

      const result = await createSprint(user.id, user.role, {
      name: body.name,
      squadId: body.squadId,
      startDate: body.startDate,
      endDate: body.endDate
    })

    return res.status(201).json(result)

  } catch (error: unknown) {
    console.error('Error creating sprint:', error)

    // Map service errors to HTTP status codes
      const statusCode = typeof error === 'object' && error !== null && 'code' in error
        ? ((error as { code?: string }).code === 'VALIDATION_ERROR' ? 400 :
           (error as { code?: string }).code === 'PERMISSION_DENIED' ? 403 :
           (error as { code?: string }).code === 'NOT_FOUND' ? 404 :
           (error as { code?: string }).code === 'CONFLICT' ? 409 : 500)
        : 500

      return res.status(statusCode).json({ error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : String(error) })
  }
}