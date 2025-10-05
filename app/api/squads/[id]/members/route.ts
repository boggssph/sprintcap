import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { devAuthGuard } from '../../../../../lib/devAuthMiddleware'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  let userId: string | null = null;
    // Use devAuthGuard in development, getServerSession in production
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_ENABLED === 'true') {
      const actor = await devAuthGuard(request)
      if (!actor || !actor.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
  userId = actor.id
    } else {
      // Use getServerSession for production
      // Note: NextRequest is not compatible with getServerSession, so we must reconstruct a compatible req/res
      // See: https://next-auth.js.org/configuration/nextjs#api-routes-app
      // Use cookies for session
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      // Get user from DB
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
      }
  userId = user.id
      if (user.role !== 'SCRUM_MASTER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const squadId = params.id

    // Validate squad ownership - user must be the scrum master of the squad
    const squad = await prisma.squad.findFirst({
      where: {
        id: squadId,
        scrumMasterId: userId
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
            name: true,
            displayName: true,
            image: true
          }
        }
      }
    })

    // Transform to the expected response format for dashboard
    const members = squadMembers.map(member => ({
      id: member.user.id,
      displayName: member.user.displayName || member.user.name || member.user.email,
      email: member.user.email,
      squadName: squad.name,
      squadAlias: squad.alias,
      dateJoined: member.createdAt,
      avatar: member.user.image || ''
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