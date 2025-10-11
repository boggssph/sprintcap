import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, User } from "lucide-react";
import { WorkType, ParentType, PlannedUnplanned, Ticket } from "@/lib/types/ticket";

interface TicketListProps {
  tickets: Ticket[];
  squadMembers: Array<{ id: string; displayName: string }>;
  onTicketDeleted: () => void;
}

export function TicketList({
  tickets,
  squadMembers,
  onTicketDeleted,
}: TicketListProps) {
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  const getWorkTypeColor = (workType: WorkType) => {
    switch (workType) {
      case WorkType.BACKEND:
        return "bg-blue-100 text-blue-800";
      case WorkType.FRONTEND:
        return "bg-green-100 text-green-800";
      case WorkType.TESTING:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getParentTypeColor = (parentType: ParentType) => {
    switch (parentType) {
      case ParentType.BUG:
        return "bg-red-100 text-red-800";
      case ParentType.STORY:
        return "bg-yellow-100 text-yellow-800";
      case ParentType.TASK:
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlannedUnplannedColor = (plannedUnplanned: PlannedUnplanned) => {
    return plannedUnplanned === PlannedUnplanned.PLANNED
      ? "bg-emerald-100 text-emerald-800"
      : "bg-orange-100 text-orange-800";
  };

  const handleDeleteTicket = async (ticketId: string) => {
    setDeletingTicketId(ticketId);
    try {
      const response = await fetch(`/api/sprints/${tickets[0]?.sprintId}/tickets/${ticketId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete ticket");
      }

      onTicketDeleted();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      // TODO: Add proper error handling/toast notification
    } finally {
      setDeletingTicketId(null);
    }
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return "Unassigned";
    const member = squadMembers.find(m => m.id === memberId);
    return member?.displayName || "Unknown";
  };

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-center">
            No tickets in this sprint yet.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Add your first ticket using the button above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {ticket.jiraId}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getWorkTypeColor(ticket.workType)}>
                    {ticket.workType}
                  </Badge>
                  <Badge className={getParentTypeColor(ticket.parentType)}>
                    {ticket.parentType}
                  </Badge>
                  <Badge className={getPlannedUnplannedColor(ticket.plannedUnplanned)}>
                    {ticket.plannedUnplanned}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete ticket {ticket.jiraId}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deletingTicketId === ticket.id}
                      >
                        {deletingTicketId === ticket.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Hours:</span> {ticket.hours}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="font-medium">Assigned:</span> {getMemberName(ticket.memberId)}
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Created: {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}