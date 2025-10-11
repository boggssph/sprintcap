import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { devAuthGuard } from '../../../../../lib/devAuthMiddleware'
import { prisma } from '../../../../../lib/prisma'
import { TicketService } from '../../../../../lib/services/ticketService'

export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
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
        { error: 'Forbidden', message: 'Only Scrum Masters can access tickets' },
        { status: 403 }
      )
    }

    // Get tickets for the sprint
    const tickets = await TicketService.getTicketsForSprint(params.sprintId, dbUser.id)

    return NextResponse.json({ tickets })

  } catch (error) {
    console.error('Error fetching tickets:', error)

    if (error instanceof Error) {
      if (error.message === 'Sprint not found') {
        return NextResponse.json(
          { error: 'Not found', message: 'Sprint not found' },
          { status: 404 }
        )
      }

      if (error.message === 'Unauthorized: Not the Scrum Master for this squad') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You are not the Scrum Master for this squad' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sprintId: string } }
) {
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
        { error: 'Forbidden', message: 'Only Scrum Masters can create tickets' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate request data
    const { validateCreateTicketRequest } = await import('../../../../../lib/validations/ticket')
    const validationErrors = validateCreateTicketRequest(body)

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
        { status: 400 }
      )
    }

    // Create the ticket
    const ticket = await TicketService.createTicket(params.sprintId, body, dbUser.id)

    return NextResponse.json(ticket, { status: 201 })

  } catch (error) {
    console.error('Error creating ticket:', error)

    if (error instanceof Error) {
      if (error.message === 'Sprint not found') {
        return NextResponse.json(
          { error: 'Not found', message: 'Sprint not found' },
          { status: 404 }
        )
      }

      if (error.message === 'Unauthorized: Not the Scrum Master for this squad') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You are not the Scrum Master for this squad' },
          { status: 403 }
        )
      }

      if (error.message === 'Ticket with this Jira ID already exists in sprint') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Ticket with this Jira ID already exists in sprint' },
          { status: 409 }
        )
      }

      if (error.message === 'Member not found in this squad') {
        return NextResponse.json(
          { error: 'Bad request', message: 'Assigned member is not part of this squad' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}