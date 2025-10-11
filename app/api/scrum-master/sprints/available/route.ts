import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { devAuthGuard } from '../../../../../lib/devAuthMiddleware'
import { prisma } from '../../../../../lib/prisma'
import { TicketService } from '../../../../../lib/services/ticketService'

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    const devUser = await devAuthGuard(request)

    if (!session && !devUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = devUser || session?.user
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found', message: 'User account not found in database' },
        { status: 404 }
      )
    }

    // Verify user is a Scrum Master
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only Scrum Masters can access available sprints' },
        { status: 403 }
      )
    }

    // Get available sprints for the Scrum Master
    const sprints = await TicketService.getAvailableSprints(dbUser.id)

    return NextResponse.json({ sprints })

  } catch (error) {
    console.error('Error fetching available sprints:', error)

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch available sprints' },
      { status: 500 }
    )
  }
}