/**
 * Capacity Plan Service
 * Handles business logic for capacity planning operations
 */

import { prisma } from '@/lib/prisma';
import { jiraService } from './jiraService';
import type { CapacityTicket, Sprint } from '@prisma/client';

export interface CreateTicketData {
  title: string;
  description?: string;
  status: string;
  assignee?: string;
  jiraKey?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: string;
  assignee?: string;
}

export interface CapacityStats {
  totalTickets: number;
  ticketsByStatus: Record<string, number>;
  ticketsByAssignee: Record<string, number>;
  capacityUtilization: number; // Percentage 0-100
  estimatedCompletion?: Date;
}

export interface CapacityDashboard {
  sprint: Sprint;
  tickets: CapacityTicket[];
  stats: CapacityStats;
  recentActivity: CapacityActivity[];
  capacityMetrics: CapacityMetrics;
}

export interface CapacityActivity {
  id: string;
  type: 'created' | 'updated' | 'deleted';
  description: string;
  timestamp: Date;
}

export interface CapacityMetrics {
  teamCapacity: number;
  currentLoad: number;
  remainingCapacity: number;
}

export class CapacityPlanService {
  /**
   * Get all active sprints for a Scrum Master
   */
  async getActiveSprints(scrumMasterId: string): Promise<Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
    isActive: boolean;
    squadId: string;
    createdAt: Date;
    updatedAt: Date;
    squad: {
      id: string;
      name: string;
      alias: string;
      members: Array<{
        user: {
          id: string;
          displayName: string | null;
        };
      }>;
    };
  }>> {
    // First, get the sprints
    const sprints = await prisma.sprint.findMany({
      where: {
        isActive: true,
        squad: {
          scrumMasterId,
        },
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        status: true,
        isActive: true,
        squadId: true,
        createdAt: true,
        updatedAt: true,
        squad: {
          select: {
            id: true,
            name: true,
            alias: true,
            members: {
              select: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                  },
                },
              },
              where: {
                user: {
                  displayName: {
                    not: null,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Auto-update statuses based on current date
    const now = new Date()
    const statusUpdates: Array<{ id: string; newStatus: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' }> = []

    for (const sprint of sprints) {
      let newStatus = sprint.status as 'ACTIVE' | 'INACTIVE' | 'COMPLETED'

      if (sprint.status === 'INACTIVE' && now >= sprint.startDate && now <= sprint.endDate) {
        newStatus = 'ACTIVE'
      } else if (sprint.status === 'ACTIVE' && now > sprint.endDate) {
        newStatus = 'COMPLETED'
      }

      if (newStatus !== sprint.status) {
        statusUpdates.push({ id: sprint.id, newStatus })
      }
    }

    // Apply status updates
    if (statusUpdates.length > 0) {
      for (const update of statusUpdates) {
        await prisma.sprint.update({
          where: { id: update.id },
          data: { status: update.newStatus }
        })
      }
    }

    // Return sprints with updated statuses
    return sprints.map(sprint => {
      const statusUpdate = statusUpdates.find(u => u.id === sprint.id)
      return {
        ...sprint,
        status: statusUpdate ? statusUpdate.newStatus : sprint.status
      }
    })
  }

  /**
   * Activate a sprint for capacity planning
   */
  async activateSprint(sprintId: string, scrumMasterId: string): Promise<Sprint> {
    // Verify the user is the Scrum Master of this sprint's squad
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId,
        },
      },
    });

    if (!sprint) {
      throw new Error('Sprint not found or user is not the Scrum Master');
    }

    return prisma.sprint.update({
      where: { id: sprintId },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate a sprint
   */
  async deactivateSprint(sprintId: string, scrumMasterId: string): Promise<Sprint> {
    // Verify the user is the Scrum Master of this sprint's squad
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId,
        },
      },
    });

    if (!sprint) {
      throw new Error('Sprint not found or user is not the Scrum Master');
    }

    return prisma.sprint.update({
      where: { id: sprintId },
      data: { isActive: false },
    });
  }

  /**
   * Get all tickets for a sprint
   */
  async getSprintTickets(sprintId: string, scrumMasterId: string): Promise<CapacityTicket[]> {
    // Verify the user is the Scrum Master of this sprint's squad
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId,
        },
      },
    });

    if (!sprint) {
      throw new Error('Sprint not found or user is not the Scrum Master');
    }

    return prisma.capacityTicket.findMany({
      where: { sprintId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Create a new ticket in capacity planning
   */
  async createTicket(sprintId: string, ticketData: CreateTicketData, scrumMasterId: string): Promise<CapacityTicket> {
    // Verify the user is the Scrum Master of this sprint's squad
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId,
        },
      },
    });

    if (!sprint) {
      throw new Error('Sprint not found or user is not the Scrum Master');
    }

    // If Jira key is provided, verify it exists in Jira
    if (ticketData.jiraKey) {
      const jiraIssue = await jiraService.getInstance().getIssue(ticketData.jiraKey);
      if (!jiraIssue) {
        throw new Error('Jira issue not found');
      }
    }

    return prisma.capacityTicket.create({
      data: {
        sprintId,
        title: ticketData.title,
        description: ticketData.description,
        status: ticketData.status,
        assignee: ticketData.assignee,
        jiraKey: ticketData.jiraKey,
      },
    });
  }

  /**
   * Update an existing ticket
   */
  async updateTicket(ticketId: string, updateData: UpdateTicketData, scrumMasterId: string): Promise<CapacityTicket> {
    // Find the ticket and verify ownership through sprint
    const ticket = await prisma.capacityTicket.findFirst({
      where: { id: ticketId },
      include: {
        sprint: {
          include: {
            squad: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.sprint.squad.scrumMasterId !== scrumMasterId) {
      throw new Error('User is not the Scrum Master of this sprint');
    }

    return prisma.capacityTicket.update({
      where: { id: ticketId },
      data: updateData,
    });
  }

  /**
   * Delete a ticket
   */
  async deleteTicket(ticketId: string, scrumMasterId: string): Promise<void> {
    // Find the ticket and verify ownership through sprint
    const ticket = await prisma.capacityTicket.findFirst({
      where: { id: ticketId },
      include: {
        sprint: {
          include: {
            squad: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.sprint.squad.scrumMasterId !== scrumMasterId) {
      throw new Error('User is not the Scrum Master of this sprint');
    }

    await prisma.capacityTicket.delete({
      where: { id: ticketId },
    });
  }

  /**
   * Sync tickets with Jira
   */
  async syncWithJira(sprintId: string, scrumMasterId: string): Promise<{
    syncedTickets: CapacityTicket[];
    created: number;
    updated: number;
    deleted: number;
  }> {
    // Verify the user is the Scrum Master of this sprint's squad
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId,
        },
      },
    });

    if (!sprint) {
      throw new Error('Sprint not found or user is not the Scrum Master');
    }

    // Get all Jira issues for this sprint (this would need proper JQL based on sprint)
    // For now, we'll get all issues assigned to team members
    const teamMembers = await prisma.user.findMany({
      where: {
        squads: {
          some: {
            squadId: sprint.squadId,
          },
        },
      },
    });

    let created = 0;
    let updated = 0;
    const deleted = 0;

    // This is a simplified implementation - in reality, you'd need proper JQL
    // to get issues specifically for this sprint
    for (const member of teamMembers) {
      if (member.email) {
        const jiraIssues = await jiraService.getInstance().getIssuesByAssignee(member.email);

        for (const jiraIssue of jiraIssues) {
          // Check if ticket already exists
          const existingTicket = await prisma.capacityTicket.findFirst({
            where: {
              sprintId,
              jiraKey: jiraIssue.key,
            },
          });

          if (existingTicket) {
            // Update existing ticket
            await prisma.capacityTicket.update({
              where: { id: existingTicket.id },
              data: {
                title: jiraIssue.fields.summary,
                description: jiraIssue.fields.description,
                status: jiraIssue.fields.status.name,
                assignee: jiraIssue.fields.assignee?.emailAddress,
              },
            });
            updated++;
          } else {
            // Create new ticket
            await prisma.capacityTicket.create({
              data: {
                sprintId,
                title: jiraIssue.fields.summary,
                description: jiraIssue.fields.description,
                status: jiraIssue.fields.status.name,
                assignee: jiraIssue.fields.assignee?.emailAddress,
                jiraKey: jiraIssue.key,
              },
            });
            created++;
          }
        }
      }
    }

    // Get final list of tickets
    const syncedTickets = await this.getSprintTickets(sprintId, scrumMasterId);

    return {
      syncedTickets,
      created,
      updated,
      deleted,
    };
  }

  /**
   * Get capacity statistics for a sprint
   */
  async getCapacityStats(sprintId: string, scrumMasterId: string): Promise<CapacityStats> {
    // Verify the user is the Scrum Master of this sprint's squad
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        squad: {
          scrumMasterId,
        },
      },
    });

    if (!sprint) {
      throw new Error('Sprint not found or user is not the Scrum Master');
    }

    const tickets = await this.getSprintTickets(sprintId, scrumMasterId);

    // Calculate statistics
    const totalTickets = tickets.length;
    const ticketsByStatus: Record<string, number> = {};
    const ticketsByAssignee: Record<string, number> = {};

    tickets.forEach(ticket => {
      // Count by status
      ticketsByStatus[ticket.status] = (ticketsByStatus[ticket.status] || 0) + 1;

      // Count by assignee
      if (ticket.assignee) {
        ticketsByAssignee[ticket.assignee] = (ticketsByAssignee[ticket.assignee] || 0) + 1;
      }
    });

    // Calculate capacity utilization (simplified - assuming "Done" status means completed)
    const completedTickets = ticketsByStatus['Done'] || 0;
    const capacityUtilization = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

    return {
      totalTickets,
      ticketsByStatus,
      ticketsByAssignee,
      capacityUtilization,
    };
  }

  /**
   * Get dashboard data for capacity planning
   */
  async getDashboardData(sprintId: string, scrumMasterId: string): Promise<CapacityDashboard> {
    // Verify the user is the Scrum Master of this sprint's squad
    const sprint = await prisma.sprint.findFirst({
      where: {
        id: sprintId,
        isActive: true,
        squad: {
          scrumMasterId,
        },
      },
      include: {
        squad: true,
      },
    });

    if (!sprint) {
      throw new Error('Active sprint not found or user is not the Scrum Master');
    }

    const [tickets, stats] = await Promise.all([
      this.getSprintTickets(sprintId, scrumMasterId),
      this.getCapacityStats(sprintId, scrumMasterId),
    ]);

    // Get recent activity (simplified - last 10 ticket modifications)
    const recentActivity: CapacityActivity[] = [];
    // This would need to be implemented with proper activity logging

    // Calculate capacity metrics (simplified)
    const teamMembers = await prisma.user.count({
      where: {
        squads: {
          some: {
            squadId: sprint.squadId,
          },
        },
      },
    });

    const capacityMetrics: CapacityMetrics = {
      teamCapacity: teamMembers * 10, // Assume 10 tickets per person per sprint
      currentLoad: tickets.length,
      remainingCapacity: Math.max(0, teamMembers * 10 - tickets.length),
    };

    return {
      sprint,
      tickets,
      stats,
      recentActivity,
      capacityMetrics,
    };
  }
}

// Export singleton instance
export const capacityPlanService = new CapacityPlanService();