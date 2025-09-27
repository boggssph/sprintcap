import { NextResponse } from 'next/server'
import { acceptInvite } from '../../../../lib/inviteService'
import { rateLimit } from '../../../../lib/rateLimit'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = body.token
    const email = body.email
    if (!token || !email) return NextResponse.json({ error: 'token and email required' }, { status: 400 })

    const rl = await rateLimit(`accept:${request.headers.get('x-forwarded-for') || 'anon'}`, 600, 3600)
    if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

    const res = await acceptInvite(token, email)
    return NextResponse.json(res)
  } catch (e: any) {
    console.warn('accept error', e)
    return NextResponse.json({ error: e?.message || 'server error' }, { status: 400 })
  }
}
