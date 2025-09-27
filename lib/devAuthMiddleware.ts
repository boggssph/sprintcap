import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

// Enable only when NODE_ENV !== 'production' and DEV_AUTH_ENABLED=true
export async function devAuthGuard(request: NextRequest) {
  const enabled = process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_ENABLED === 'true'
  if (!enabled) return null

  // Priority: X-Test-User header, then query param ?test_user=
  const headerUser = request.headers.get('x-test-user')
  const url = new URL(request.url)
  const queryUser = url.searchParams.get('test_user')
  const email = (headerUser || queryUser || '').toLowerCase()
  if (!email) return null

  // Find or create a dev user
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({ data: { email, role: 'ADMIN', name: 'Dev User' } })
  }

  // Return a lightweight user object to attach to request handling
  return { id: user.id, email: user.email, role: user.role }
}
