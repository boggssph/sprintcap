import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { devAuthGuard } from '../../../../../../lib/devAuthMiddleware'
import { prisma } from '../../../../../../lib/prisma'
import { TicketService } from '../../../../../../lib/services/ticketService'

export async function GET(
  request: NextRequest,
  { params }: { params: { sprintId: string; ticketId: string } }
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

    // Get the specific ticket
    const ticket = await TicketService.getTicketById(params.ticketId, dbUser.id)

    return NextResponse.json(ticket)

  } catch (error) {
    console.error('Error fetching ticket:', error)

    if (error instanceof Error) {
      if (error.message === 'Ticket not found') {
        return NextResponse.json(
          { error: 'Not found', message: 'Ticket not found' },
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
      { error: 'Internal server error', message: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sprintId: string; ticketId: string } }
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
        { error: 'Forbidden', message: 'Only Scrum Masters can update tickets' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate request data
    const { validateUpdateTicketRequest } = await import('../../../../../../lib/validations/ticket')
    const validationErrors = validateUpdateTicketRequest(body)

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
        { status: 400 }
      )
    }

    // Update the ticket
    const ticket = await TicketService.updateTicket(params.ticketId, body, dbUser.id)

    return NextResponse.json(ticket)

  } catch (error) {
    console.error('Error updating ticket:', error)

    if (error instanceof Error) {
      if (error.message === 'Ticket not found') {
        return NextResponse.json(
          { error: 'Not found', message: 'Ticket not found' },
          { status: 404 }
        )
      }

      if (error.message === 'Unauthorized: Not the Scrum Master for this squad') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You are not the Scrum Master for this squad' },
          { status: 403 }
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
      { error: 'Internal server error', message: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sprintId: string; ticketId: string } }
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
        { error: 'Forbidden', message: 'Only Scrum Masters can delete tickets' },
        { status: 403 }
      )
    }

    // Delete the ticket
    await TicketService.deleteTicket(params.ticketId, dbUser.id)

    return new NextResponse(null, { status: 204 })

  } catch (error) {
    console.error('Error deleting ticket:', error)

    if (error instanceof Error) {
      if (error.message === 'Ticket not found') {
        return NextResponse.json(
          { error: 'Not found', message: 'Ticket not found' },
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
      { error: 'Internal server error', message: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}