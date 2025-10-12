import { NextResponse } from 'next/server'
import { createInvite, regenerateInvite, revokeInvite, listInvites } from '../../../lib/inviteService'
import { devAuthGuard } from '../../../lib/devAuthMiddleware'
import { rateLimit } from '../../../lib/rateLimit'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function POST(request: Request) {
  // Guard: during some build/prerender phases request.url can be empty or invalid.
  // Protect against throwing when constructing a URL by falling back to an empty path.
  let path = ''
  try {
    if (request?.url) {
      const url = new URL(request.url)
      path = url.pathname
    }
  } catch (err) {
    console.warn('app/api/invites: could not parse request.url', err)
    path = ''
  }
  try {
    const body = await request.json()

    // Authentication
    const session = await getServerSession(authOptions)
    const devUser = await devAuthGuard(request as unknown as import('next/server').NextRequest)

    if (!session && !devUser) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const user = devUser || session?.user
    if (!user?.email) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // Simple route dispatch by body shape or path
    if (path.endsWith('/api/invites')) {
      // Create invite
      try {
        // Rate limit per actor.email
        const rl = await rateLimit(`create:${user.email}`, 60, 3600)
        if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

        const result = await createInvite(user.email, { email: body.invitedEmail, squadId: body.squadId, role: body.invitedRole })
        return NextResponse.json(result, { status: 201 })
      } catch (e) {
        console.error('Error creating invite:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 400 })
      }
    }

    if (path.match(/\/api\/invites\/.*\/regenerate$/)) {
      // Authentication
      const session = await getServerSession(authOptions)
      const devUser = await devAuthGuard(request as unknown as import('next/server').NextRequest)

      if (!session && !devUser) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      }

      const user = devUser || session?.user
      if (!user?.email) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      }

      const id = path.split('/').slice(-2, -1)[0]
      try {
        const rl = await rateLimit(`regen:${user.email}`, 60, 3600)
        if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
        const result = await regenerateInvite(user.email, id)
        return NextResponse.json(result)
      } catch (e) {
        console.error('Error regenerating invite:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 400 })
      }
    }

    if (path.match(/\/api\/invites\/.*\/revoke$/)) {
      // Authentication
      const session = await getServerSession(authOptions)
      const devUser = await devAuthGuard(request as unknown as import('next/server').NextRequest)

      if (!session && !devUser) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      }

      const user = devUser || session?.user
      if (!user?.email) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      }

      const id = path.split('/').slice(-2, -1)[0]
      try {
        const rl = await rateLimit(`revoke:${user.email}`, 60, 3600)
        if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
        const result = await revokeInvite(user.email, id)
        return NextResponse.json(result)
      } catch (e) {
        console.error('Error revoking invite:', e)
        return NextResponse.json({ error: (e as Error).message }, { status: 400 })
      }
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    const devUser = await devAuthGuard(request as unknown as import('next/server').NextRequest)

    if (!session && !devUser) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const user = devUser || session?.user
    if (!user?.email) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor') || null
    const status = searchParams.get('status') || undefined
    const q = searchParams.get('q') || undefined

    const result = await listInvites(user.email, { limit, cursor, status, q })

    return NextResponse.json({
      invites: result.invites,
      nextCursor: result.nextCursor
    })
  } catch (e) {
    console.error('Error listing invites:', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
