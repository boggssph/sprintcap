import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { getSprint } from '../../../lib/services/sprintService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET for sprint details
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

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

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Sprint ID is required' })
    }

    const result = await getSprint(session.user.id, userRole, id)
    return res.status(200).json(result)

  } catch (error: any) {
    console.error('Error getting sprint:', error)

    // Map service errors to HTTP status codes
    const statusCode = error.code === 'PERMISSION_DENIED' ? 403 :
                      error.code === 'NOT_FOUND' ? 404 : 500

    return res.status(statusCode).json({ error: error.message })
  }
}