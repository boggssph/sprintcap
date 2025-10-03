import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { devAuthGuard } from '../../../../../lib/devAuthMiddleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const actor = await devAuthGuard(request)
    if (!actor || !actor.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const squadId = params.id

    // Validate squad ownership - user must be the scrum master of the squad
    const squad = await prisma.squad.findFirst({
      where: {
        id: squadId,
        scrumMasterId: actor.id // Assuming actor.id is available from devAuthGuard
      }
    })

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found or access denied' }, { status: 404 })
    }

    // Get active members for the squad
    // Note: Current schema doesn't have isActive field on SquadMember
    // All SquadMembers are considered active for now
    const squadMembers = await prisma.squadMember.findMany({
      where: {
        squadId: squadId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    // Transform to the expected response format
    const members = squadMembers.map(member => ({
      id: member.user.id,
      email: member.user.email,
      name: member.user.name || member.user.email // Fallback to email if name is null
    }))

    const response = {
      members: members,
      squad: {
        id: squad.id,
        name: squad.name,
        alias: squad.alias
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching squad members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}