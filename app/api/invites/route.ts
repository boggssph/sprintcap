import { NextResponse } from 'next/server'
import { createInvite, regenerateInvite, revokeInvite } from '../../../lib/inviteService'
import { devAuthGuard } from '../../../lib/devAuthMiddleware'
import { rateLimit } from '../../../lib/rateLimit'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname
  try {
    const body = await request.json()

    // Simple route dispatch by body shape or path
    if (path.endsWith('/api/invites')) {
      // Create invite
      const actor = (await devAuthGuard(request as any)) || { email: body._actor }
      if (!actor || !actor.email) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

      // Rate limit per actor.email
  const rl = await rateLimit(`create:${actor.email}`, 60, 3600)
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const result = await createInvite(actor.email, { email: body.invitedEmail, squadId: body.squadId, role: body.invitedRole })
      return NextResponse.json(result, { status: 201 })
    }

    if (path.match(/\/api\/invites\/.*\/regenerate$/)) {
      const actor = (await devAuthGuard(request as any)) || { email: body._actor }
      if (!actor || !actor.email) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      const id = path.split('/').slice(-2, -1)[0]
  const rl = await rateLimit(`regen:${actor.email}`, 60, 3600)
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
      const result = await regenerateInvite(actor.email, id)
      return NextResponse.json(result)
    }

    if (path.match(/\/api\/invites\/.*\/revoke$/)) {
      const actor = (await devAuthGuard(request as any)) || { email: body._actor }
      if (!actor || !actor.email) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      const id = path.split('/').slice(-2, -1)[0]
  const rl = await rateLimit(`revoke:${actor.email}`, 60, 3600)
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
      const result = await revokeInvite(actor.email, id)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
