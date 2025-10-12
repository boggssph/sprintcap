import { NextRequest, NextResponse } from 'next/server'
import { listInvites } from '../../../lib/inviteService'
import { devAuthGuard } from '../../../lib/devAuthMiddleware'

export async function GET(request: NextRequest) {
  try {
    const actor = await devAuthGuard(request)
    if (!actor || !actor.email) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor') || null
    const status = searchParams.get('status') || undefined
    const q = searchParams.get('q') || undefined

    const result = await listInvites(actor.email, { limit, cursor, status, q })

    return NextResponse.json({
      invites: result.invites,
      nextCursor: result.nextCursor
    })
  } catch (e) {
    console.error('Error listing invites:', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}