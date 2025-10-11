"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface CapacityPlanCardProps {
  ticket: {
    id: string
    jiraId: string
    hours: number
    workType: string
    parentType: string
    plannedUnplanned: string
    memberId: string | null
    sprintId: string
    createdAt: Date
    updatedAt: Date
    member?: {
      id: string
      displayName: string
      name: string
      email: string
    }
  }
  onEdit?: (ticketId: string) => void
  onDelete?: (ticketId: string) => void
}

export default function CapacityPlanCard({
  ticket,
  onEdit,
  onDelete
}: CapacityPlanCardProps) {
  const getWorkTypeColor = (workType: string) => {
    switch (workType.toLowerCase()) {
      case 'backend':
        return 'bg-blue-100 text-blue-800'
      case 'frontend':
        return 'bg-green-100 text-green-800'
      case 'testing':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getParentTypeColor = (parentType: string) => {
    switch (parentType.toLowerCase()) {
      case 'bug':
        return 'bg-red-100 text-red-800'
      case 'story':
        return 'bg-blue-100 text-blue-800'
      case 'task':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {ticket.jiraId}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500">
                {ticket.hours}h
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(ticket.id)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(ticket.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            <Badge className={getWorkTypeColor(ticket.workType)}>
              {ticket.workType}
            </Badge>
            <Badge className={getParentTypeColor(ticket.parentType)}>
              {ticket.parentType}
            </Badge>
            <Badge variant={ticket.plannedUnplanned === 'PLANNED' ? 'default' : 'secondary'}>
              {ticket.plannedUnplanned}
            </Badge>
          </div>

          {ticket.member && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Assigned to:</span>
              <span className="font-medium">{ticket.member.displayName}</span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Created {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}