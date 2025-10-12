import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkInvitationsWithCreator() {
  try {
    console.log('Checking Invitation table with creator info...')

    const invitations = await prisma.invitation.findMany({
      include: {
        squad: {
          select: {
            name: true,
            alias: true
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\nFound ${invitations.length} invitations:\n`)

    invitations.forEach((invite, index) => {
      console.log(`${index + 1}. Email: ${invite.email}`)
      console.log(`   Role: ${invite.invitedRole || 'MEMBER'}`)
      console.log(`   Status: ${invite.status}`)
      console.log(`   Squad: ${invite.squad ? `${invite.squad.name} (${invite.squad.alias})` : 'None'}`)
      console.log(`   Created By: ${invite.createdBy.email} (${invite.createdBy.role})`)
      console.log(`   Created: ${invite.createdAt.toLocaleString()}`)
      console.log(`   Expires: ${invite.expiresAt.toLocaleString()}`)
      console.log('   ---')
    })

  } catch (error) {
    console.error('Error checking invitations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkInvitationsWithCreator()