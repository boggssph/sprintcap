import { describe, it, expect } from 'vitest'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

describe('Auth callback logic (signIn)', () => {
  it('should allow an existing user to sign in and attach role', async () => {
    const email = `test+auth-${Date.now()}@example.com`
    // seed a user
    const user = await prisma.user.create({ data: { email, name: 'Seed', role: 'MEMBER' } as any })

    const nextAuthUser = { email, name: 'Seed' }
    // call signIn callback directly
    const result = await (authOptions.callbacks as any).signIn({ user: nextAuthUser })
    expect(result).toBe('/dashboard/member')

    // cleanup
    await prisma.user.delete({ where: { id: user.id } })
  })

  it('should redirect unknown users to access request page', async () => {
    const email = `test+unknown-${Date.now()}@example.com`
    const nextAuthUser = { email, name: 'Unknown' }
    const result = await (authOptions.callbacks as any).signIn({ user: nextAuthUser })
    expect(result).toBe(`/auth/request-access?email=${encodeURIComponent(email)}&name=Unknown&image=&providerId=`)
  })
})
