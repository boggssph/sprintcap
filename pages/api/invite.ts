import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { listInvites, createInvite, regenerateInvite, revokeInvite } from '../../lib/inviteService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow listing invites
  if (req.method === 'GET') {
    // Dev/test helper: allow bypassing NextAuth when NODE_ENV !== 'production' by providing
    // an `x-test-user` header or `?test_user=` query param. This helps E2E tests avoid stubbing auth.
  let session: any = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = { user: { email: testUser.toLowerCase(), name: testUser } }
      }
    }
    if (!session) session = await getServerSession(req, res, authOptions as any)
    if (!session || !(session as any).user?.email) return res.status(401).json({ error: 'unauthenticated' })
    try {
      const data = await listInvites((session as any).user.email, { limit: parseInt((req.query.limit as string) || '20'), cursor: req.query.cursor as string | undefined, status: req.query.status as string | undefined, q: (req.query.q as string | undefined) || undefined })
      return res.status(200).json(data)
    } catch (e: any) {
      return res.status(403).json({ error: e.message })
    }
  }

  if (req.method !== 'POST') return res.status(405).end()

  const body = req.body || {}
    try {
    // Dev/test helper: allow bypassing NextAuth when NODE_ENV !== 'production' by providing
    // an `x-test-user` header or `?test_user=` query param. This helps E2E tests avoid stubbing auth.
  let session: any = null
    if (process.env.NODE_ENV !== 'production') {
      const testUser = (req.headers['x-test-user'] as string) || (req.query.test_user as string | undefined)
      if (testUser) {
        session = { user: { email: testUser.toLowerCase(), name: testUser } }
      }
    }
    if (!session) session = await getServerSession(req, res, authOptions as any)
    if (!session || !(session as any).user?.email) return res.status(401).json({ error: 'unauthenticated' })
    const actorEmail = (session as any).user.email

    if (body.action === 'regenerate') {
      const { inviteId } = body
      if (!inviteId) return res.status(400).json({ error: 'inviteId required' })
      try {
        const data = await regenerateInvite(actorEmail, inviteId)
        return res.status(200).json(data)
      } catch (e:any) { return res.status(403).json({ error: e.message }) }
    }

    if (body.action === 'revoke') {
      const { inviteId } = body
      if (!inviteId) return res.status(400).json({ error: 'inviteId required' })
      try {
        const data = await revokeInvite(actorEmail, inviteId)
        return res.status(200).json(data)
      } catch (e:any) { return res.status(403).json({ error: e.message }) }
    }

    // create
    const { email, squadId, role } = body
    if (!email) return res.status(400).json({ error: 'email required' })
    try {
      const data = await createInvite((session as any).user.email, { email, squadId, role })
      return res.status(201).json(data)
    } catch (e:any) {
      return res.status(400).json({ error: e.message })
    }
  } catch (e:any) {
    return res.status(500).json({ error: e.message })
  }
}

// Note: the route above handles GET and POST. To support revoke via POST action: 'revoke'
