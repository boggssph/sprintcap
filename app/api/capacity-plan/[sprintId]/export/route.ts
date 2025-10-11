import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { devAuthGuard } from '@/lib/devAuthMiddleware'
import { prisma } from '@/lib/prisma'
import { capacityPlanService } from '@/lib/services/capacityPlanService'
import { rateLimit } from '@/lib/rateLimit'

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
      where: { email: user.email },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not found' },
        { status: 401 }
      )
    }

    // Only Scrum Masters can export capacity data
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

    const { sprintId } = params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Format must be json or csv' },
        { status: 400 }
      )
    }

    // Get sprint and tickets data
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId: dbUser.id,
        },
      },
      include: {
        squad: true,
      },
    });

    if (!sprint) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found or access denied' },
        { status: 404 }
      )
    }

    const tickets = await capacityPlanService.getSprintTickets(sprintId, dbUser.id)
    const stats = await capacityPlanService.getCapacityStats(sprintId, dbUser.id)

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Title,Status,Assignee,Jira Key,Created At,Updated At\n'
      const csvRows = tickets.map(ticket =>
        `"${ticket.title}","${ticket.status}","${ticket.assignee || ''}","${ticket.jiraKey || ''}","${ticket.createdAt.toISOString()}","${ticket.updatedAt.toISOString()}"`
      ).join('\n')

      const csvContent = csvHeader + csvRows

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="capacity-plan-${sprint.name}.csv"`,
        },
      })
    }

    // Default JSON format
    const exportData = {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        isActive: sprint.isActive,
        squad: {
          name: sprint.squad.name,
          alias: sprint.squad.alias,
        },
      },
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        assignee: ticket.assignee,
        jiraKey: ticket.jiraKey,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      })),
      statistics: stats,
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error exporting capacity data:', error)

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Sprint not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to export capacity data' },
      { status: 500 }
    )
  }
}