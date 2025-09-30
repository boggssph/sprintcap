import type { NextApiRequest, NextApiResponse } from 'next'
import type { DefaultSession } from 'next-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { listInvites, createInvite, regenerateInvite, revokeInvite } from '../../lib/inviteService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow listing invites
  if (req.method === 'GET') {
    // Dev/test helper: allow bypassing NextAuth when NODE_ENV !== 'production' by providing
    // an `x-test-user` header or `?test_user=` query param. This helps E2E tests avoid stubbing auth.
  let session: DefaultSession | null = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = {
          user: {
            email: testUser.toLowerCase(),
            name: testUser,
            image: null
          },
          expires: new Date(Date.now() + 1000 * 60 * 60).toISOString()
        }
      }
    }
  if (!session) session = await getServerSession(req, res, authOptions)
  if (!session || !('user' in session) || !session.user || typeof session.user.email !== 'string') return res.status(401).json({ error: 'unauthenticated' })
    try {
      const userEmail = session.user.email
      const data = await listInvites(userEmail, { limit: parseInt((req.query.limit as string) || '20'), cursor: req.query.cursor as string | undefined, status: req.query.status as string | undefined, q: (req.query.q as string | undefined) || undefined })
      return res.status(200).json(data)
    } catch (e) {
      return res.status(403).json({ error: typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e) })
    }
  }

  if (req.method !== 'POST') return res.status(405).end()

  const body = req.body || {}
    try {
    // Dev/test helper: allow bypassing NextAuth when NODE_ENV !== 'production' by providing
    // an `x-test-user` header or `?test_user=` query param. This helps E2E tests avoid stubbing auth.
  let session: DefaultSession | null = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = {
          user: {
            email: testUser.toLowerCase(),
            name: testUser,
            image: null
          },
          expires: new Date(Date.now() + 1000 * 60 * 60).toISOString()
        }
      }
    }
  if (!session) session = await getServerSession(req, res, authOptions)
  if (!session || !('user' in session) || !session.user || typeof session.user.email !== 'string') return res.status(401).json({ error: 'unauthenticated' })
  const actorEmail = session.user.email

    if (body.action === 'regenerate') {
      const { inviteId } = body
      if (!inviteId) return res.status(400).json({ error: 'inviteId required' })
      try {
        const data = await regenerateInvite(actorEmail, inviteId)
        return res.status(200).json(data)
  } catch (e) { return res.status(403).json({ error: typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e) }) }
    }

    if (body.action === 'revoke') {
      const { inviteId } = body
      if (!inviteId) return res.status(400).json({ error: 'inviteId required' })
      try {
        const data = await revokeInvite(actorEmail, inviteId)
        return res.status(200).json(data)
  } catch (e) { return res.status(403).json({ error: typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e) }) }
    }

    // create
    const { email, emails, squadId, role } = body
    
    // Support both single email and multiple emails
    const emailList = emails || (email ? [email] : [])
    
    if (!emailList.length) return res.status(400).json({ error: 'email(s) required' })
    if (emailList.length > 10) return res.status(400).json({ error: 'maximum 10 emails allowed' })
    
    try {
      const results: unknown[] = []
      for (const emailAddr of emailList) {
        const data = await createInvite(session.user.email, { email: emailAddr, squadId, role })
        results.push(data)
      }
      return res.status(201).json({ invites: results })
    } catch (e) {
      return res.status(400).json({ error: typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e) })
    }
  } catch (e) {
    return res.status(500).json({ error: typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e) })
  }
}

// Note: the route above handles GET and POST. To support revoke via POST action: 'revoke'
