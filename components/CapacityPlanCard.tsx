"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Edit, Trash2 } from "lucide-react"

interface CapacityPlanCardProps {
  ticket: {
    id: string
    title: string
    description?: string
    status: string
    assignee?: string
    jiraKey?: string
    createdAt: Date
    updatedAt: Date
  }
  onEdit?: (ticketId: string) => void
  onDelete?: (ticketId: string) => void
}

export default function CapacityPlanCard({
  ticket,
  onEdit,
  onDelete
}: CapacityPlanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to do':
      case 'todo':
        return 'bg-gray-100 text-gray-800'
      case 'in progress':
      case 'inprogress':
        return 'bg-blue-100 text-blue-800'
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
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
              {ticket.title}
            </CardTitle>
            {ticket.jiraKey && (
              <div className="flex items-center gap-1 mt-1">
                <ExternalLink className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-mono">
                  {ticket.jiraKey}
                </span>
              </div>
            )}
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
          {ticket.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {ticket.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>

            {ticket.assignee && (
              <span className="text-xs text-gray-500">
                {ticket.assignee}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400">
            Updated {new Date(ticket.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}