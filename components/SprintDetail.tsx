"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddTicketDrawer } from "./AddTicketDrawer";
import { TicketList } from "./TicketList";
import { Ticket } from "@/lib/types/ticket";
import { Calendar, Users, Clock } from "lucide-react";

interface SprintDetailProps {
  sprintId: string;
  onBack?: () => void;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  squadId: string;
  squad: {
    id: string;
    name: string;
    members: Array<{
      user: {
        id: string;
        displayName: string;
      };
    }>;
  };
}

export function SprintDetail({ sprintId, onBack }: SprintDetailProps) {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchSprintAndTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sprint details
      const sprintRes = await fetch(`/api/sprints/${sprintId}`);
      if (!sprintRes.ok) {
        throw new Error("Failed to load sprint");
      }
      const sprintData = await sprintRes.json();
      setSprint(sprintData.sprint);

      // Fetch tickets
      const ticketsRes = await fetch(`/api/sprints/${sprintId}/tickets`);
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets || []);
      }
    } catch (error) {
      console.error("Failed to fetch sprint data:", error);
      setError("Failed to load sprint data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sprintId) {
      fetchSprintAndTickets();
    }
  }, [sprintId, refreshTrigger]);

  const handleTicketAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTicketDeleted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSquadMembers = () => {
    if (!sprint?.squad.members) return [];
    return sprint.squad.members.map(member => ({
      id: member.user.id,
      displayName: member.user.displayName || member.user.id,
    }));
  };

  const totalHours = tickets.reduce((sum, ticket) => sum + ticket.hours, 0);
  const assignedTickets = tickets.filter(ticket => ticket.memberId).length;
  const unassignedTickets = tickets.filter(ticket => !ticket.memberId).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading sprint...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !sprint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error || "Sprint not found"}</CardDescription>
        </CardHeader>
        {onBack && (
          <CardContent>
            <Button onClick={onBack} variant="outline">
              Back to Sprints
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{sprint.name}</CardTitle>
              <CardDescription className="text-lg">
                {sprint.squad.name}
              </CardDescription>
            </div>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                Back to Sprints
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Team</div>
                <div className="text-sm text-muted-foreground">
                  {getSquadMembers().length} members
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Total Hours</div>
                <div className="text-sm text-muted-foreground">
                  {totalHours} hours planned
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{assignedTickets}</div>
            <p className="text-xs text-muted-foreground">Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{unassignedTickets}</div>
            <p className="text-xs text-muted-foreground">Unassigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Ticket Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Ticket</CardTitle>
          <CardDescription>
            Add tickets to this sprint. Each ticket must have a unique Jira ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddTicketDrawer
            sprintId={sprintId}
            squadMembers={getSquadMembers()}
            onTicketAdded={handleTicketAdded}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Tickets List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tickets ({tickets.length})</h3>
        <TicketList
          tickets={tickets}
          squadMembers={getSquadMembers()}
          onTicketDeleted={handleTicketDeleted}
        />
      </div>
    </div>
  );
}