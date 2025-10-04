import { beforeAll } from 'vitest'
import { prisma } from '../lib/prisma'

beforeAll(async () => {
  // Ensure test user exists for contract/integration tests
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'SCRUM_MASTER',
    },
  })
})
