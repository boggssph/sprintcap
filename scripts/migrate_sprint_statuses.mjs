/**
 * Migration script to update existing sprint statuses based on current dates
 * Run this once to fix existing sprints that may have incorrect status values
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateSprintStatuses() {
  console.log('Starting sprint status migration...')

  const now = new Date()
  let updatedCount = 0

  try {
    // Update INACTIVE sprints that should be ACTIVE (current date within range)
    const inactiveToActive = await prisma.sprint.updateMany({
      where: {
        status: 'INACTIVE',
        startDate: { lte: now },
        endDate: { gte: now }
      },
      data: { status: 'ACTIVE' }
    })

    console.log(`Updated ${inactiveToActive.count} INACTIVE sprints to ACTIVE`)
    updatedCount += inactiveToActive.count

    // Update ACTIVE sprints that should be COMPLETED (current date past end date)
    const activeToCompleted = await prisma.sprint.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: now }
      },
      data: { status: 'COMPLETED' }
    })

    console.log(`Updated ${activeToCompleted.count} ACTIVE sprints to COMPLETED`)
    updatedCount += activeToCompleted.count

    console.log(`Migration completed. Total sprints updated: ${updatedCount}`)

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateSprintStatuses()
  .then(() => {
    console.log('Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })