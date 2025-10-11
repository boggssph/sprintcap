import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { capacityPlanService } from '@/lib/services/capacityPlanService'
import { bulkOperationSchema } from '@/lib/validations/ticketValidation'
import { rateLimit } from '@/lib/rateLimit'

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
      where: { email: user.email },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      )
    }

    // Only Scrum Masters can perform bulk operations
    if (dbUser.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Scrum Master role required' },
        { status: 403 }
      )
    }

    // Rate limiting: 60 requests per hour per user
    const rateLimitResult = await rateLimit(`capacity-plan:${dbUser.id}`, 60, 3600)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validationResult = bulkOperationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request body',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { sprintId } = params
    const { operation, tickets } = validationResult.data

    // For now, we'll implement a simple version that handles partial failures
    // In a real implementation, this would be more sophisticated
    const results: Array<{
      success: boolean;
      ticket?: { id: string; title: string; status: string; assignee?: string; jiraKey?: string };
      error?: string;
      ticketData?: typeof tickets[0];
      ticketId?: string;
    }> = []
    let hasErrors = false

    if (operation === 'create') {
      for (const ticketData of tickets) {
        try {
          const ticket = await capacityPlanService.createTicket(sprintId, ticketData, dbUser.id)
          results.push({
            success: true,
            ticket: {
              id: ticket.id,
              title: ticket.title,
              status: ticket.status,
              assignee: ticket.assignee || undefined,
              jiraKey: ticket.jiraKey || undefined,
            },
          })
        } catch (error) {
          hasErrors = true
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            ticketData,
          })
        }
      }
    } else if (operation === 'update') {
      for (const ticketUpdate of tickets) {
        try {
          const ticket = await capacityPlanService.updateTicket(ticketUpdate.id, ticketUpdate, dbUser.id)
          results.push({
            success: true,
            ticket: {
              id: ticket.id,
              title: ticket.title,
              status: ticket.status,
              assignee: ticket.assignee || undefined,
              jiraKey: ticket.jiraKey || undefined,
            },
          })
        } catch (error) {
          hasErrors = true
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            ticketId: ticketUpdate.id,
          })
        }
      }
    }

    // Return appropriate status based on results
    const status = hasErrors ? 207 : 200 // 207 = Multi-Status for partial success

    return NextResponse.json({
      operation,
      results,
      summary: {
        total: tickets.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    }, { status })
  } catch (error) {
    console.error('Error performing bulk operation:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Sprint not found or access denied' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}