import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkInvitations() {
  try {
    console.log('Checking Invitation table...')

    const invitations = await prisma.invitation.findMany({
      include: {
        squad: {
          select: {
            name: true,
            alias: true
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
      console.log(`   Created: ${invite.createdAt.toLocaleString()}`)
      console.log(`   Expires: ${invite.expiresAt.toLocaleString()}`)
      console.log('   ---')
    })

    // Count by role
    const memberInvites = invitations.filter(i => i.invitedRole === 'MEMBER')
    const scrumMasterInvites = invitations.filter(i => i.invitedRole === 'SCRUM_MASTER')
    const adminInvites = invitations.filter(i => i.invitedRole === 'ADMIN')

    console.log('\nSummary:')
    console.log(`Total Invitations: ${invitations.length}`)
    console.log(`Member Invites: ${memberInvites.length}`)
    console.log(`Scrum Master Invites: ${scrumMasterInvites.length}`)
    console.log(`Admin Invites: ${adminInvites.length}`)

  } catch (error) {
    console.error('Error checking invitations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkInvitations()