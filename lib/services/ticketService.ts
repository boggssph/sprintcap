/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { prisma } from '@/lib/prisma'
import { Ticket, CreateTicketRequest, UpdateTicketRequest } from '@/lib/types/ticket'

export class TicketService {
  /**
   * Get all tickets for a specific sprint
   */
  static async getTicketsForSprint(sprintId: string, userId: string): Promise<Ticket[]> {
    // Verify user has access to this sprint (is Scrum Master of the squad)
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { squad: true }
    })

    if (!sprint) {
      throw new Error('Sprint not found')
    }

    if (sprint.squad.scrumMasterId !== userId) {
      throw new Error('Unauthorized: Not the Scrum Master for this squad')
    }

    const tickets = await prisma.ticket.findMany({
      where: { sprintId },
      include: {
        member: {
          select: {
            id: true,
            displayName: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return tickets as unknown as Ticket[];
  }

  /**
   * Get a specific ticket by ID
   */
  static async getTicketById(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        sprint: {
          include: { squad: true }
        },
        member: {
          select: {
            id: true,
            displayName: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Verify user has access to this ticket's sprint
    if (ticket.sprint.squad.scrumMasterId !== userId) {
      throw new Error('Unauthorized: Not the Scrum Master for this squad')
    }

    return ticket as Ticket
  }

  /**
   * Create a new ticket
   */
  static async createTicket(sprintId: string, data: CreateTicketRequest, userId: string): Promise<Ticket> {
    // Verify user has access to this sprint
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { squad: true }
    })

    if (!sprint) {
      throw new Error('Sprint not found')
    }

    if (sprint.squad.scrumMasterId !== userId) {
      throw new Error('Unauthorized: Not the Scrum Master for this squad')
    }

    // Check for duplicate jiraId within this sprint
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        sprintId,
        jiraId: data.jiraId
      }
    })

    if (existingTicket) {
      throw new Error('Ticket with this Jira ID already exists in sprint')
    }

    // If memberId is provided, verify the member exists in the squad
    if (data.memberId) {
      const memberExists = await prisma.squadMember.findFirst({
        where: {
          squadId: sprint.squadId,
          userId: data.memberId
        }
      })

      if (!memberExists) {
        throw new Error('Member not found in this squad')
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        ...data,
        sprintId
      },
      include: {
        member: {
          select: {
            id: true,
            displayName: true,
            name: true,
            email: true
          }
        }
      }
    })

    return ticket as Ticket
  }

  /**
   * Update an existing ticket
   */
  static async updateTicket(ticketId: string, data: UpdateTicketRequest, userId: string): Promise<Ticket> {
    // First get the ticket to verify access
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        sprint: {
          include: { squad: true }
        }
      }
    })

    if (!existingTicket) {
      throw new Error('Ticket not found')
    }

    // Verify user has access to this ticket's sprint
    if (existingTicket.sprint.squad.scrumMasterId !== userId) {
      throw new Error('Unauthorized: Not the Scrum Master for this squad')
    }

    // If memberId is being updated, verify the member exists in the squad
    if (data.memberId !== undefined) {
      if (data.memberId) {
        const memberExists = await prisma.squadMember.findFirst({
          where: {
            squadId: existingTicket.sprint.squadId,
            userId: data.memberId
          }
        })

        if (!memberExists) {
          throw new Error('Member not found in this squad')
        }
      }
      // If memberId is null, that's fine (unassigning)
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data,
      include: {
        member: {
          select: {
            id: true,
            displayName: true,
            name: true,
            email: true
          }
        }
      }
    })

    return ticket as Ticket
  }

  /**
   * Delete a ticket
   */
  static async deleteTicket(ticketId: string, userId: string): Promise<void> {
    // First get the ticket to verify access
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        sprint: {
          include: { squad: true }
        }
      }
    })

    if (!existingTicket) {
      throw new Error('Ticket not found')
    }

    // Verify user has access to this ticket's sprint
    if (existingTicket.sprint.squad.scrumMasterId !== userId) {
      throw new Error('Unauthorized: Not the Scrum Master for this squad')
    }

    await prisma.ticket.delete({
      where: { id: ticketId }
    })
  }

  /**
   * Get available sprints for a Scrum Master
   */
  static async getAvailableSprints(userId: string) {
    // Get all squads where user is Scrum Master
    const squads = await prisma.squad.findMany({
      where: { scrumMasterId: userId },
      include: {
        sprints: {
          where: {
            status: {
              in: ['ACTIVE', 'INACTIVE'] // Only active and future sprints
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    })

    // Flatten sprints from all squads
    const sprints = squads.flatMap(squad =>
      squad.sprints.map(sprint => ({
        ...sprint,
        squadName: squad.name,
        squadAlias: squad.alias
      }))
    )

    return sprints
  }
}