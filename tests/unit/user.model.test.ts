import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../../lib/prisma'

describe('User model CRUD', () => {
  beforeAll(async () => {
    // clean test users with a test prefix if needed
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'test+' } } })
    await prisma.$disconnect()
  })

  it('creates and finds a user by email and providerId', async () => {
    const email = `test+user-${Date.now()}@example.com`
    const providerId = `prov-${Date.now()}`

    const created = await prisma.user.create({ data: { email, name: 'Test User', providerId, role: 'MEMBER' } as any })
    expect(created).toHaveProperty('id')

    const byEmail = await prisma.user.findUnique({ where: { email } })
    expect(byEmail).not.toBeNull()

    const byProvider = await prisma.user.findFirst({ where: { providerId } })
    expect(byProvider).not.toBeNull()
  })
})
