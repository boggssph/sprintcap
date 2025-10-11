"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Calendar, CheckCircle } from "lucide-react"
import CapacityPlanGrid from "./CapacityPlanGrid"
import { useRouter } from "next/navigation"

interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: string
  isActive: boolean
  squad: {
    id: string
    name: string
    alias: string
  }
}

interface Ticket {
  id: string
  title: string
  description?: string
  status: string
  assignee?: string
  jiraKey?: string
  createdAt: Date
  updatedAt: Date
}

export default function CapacityPlanTab() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTicketsLoading, setIsTicketsLoading] = useState(false)
  const router = useRouter()

  // Fetch active sprints on mount
  useEffect(() => {
    fetchActiveSprints()
  }, [])

  // Fetch tickets when sprint is selected
  useEffect(() => {
    if (selectedSprint) {
      fetchSprintTickets(selectedSprint.id)
    }
  }, [selectedSprint])

  const fetchActiveSprints = async () => {
    try {
      const response = await fetch('/api/capacity-plan/active-sprints')
      if (response.ok) {
        const data = await response.json()
        setSprints(data.sprints)
      }
    } catch (error) {
      console.error('Failed to fetch active sprints:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSprintTickets = async (sprintId: string) => {
    setIsTicketsLoading(true)
    try {
      const response = await fetch(`/api/capacity-plan/${sprintId}/tickets`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Failed to fetch sprint tickets:', error)
    } finally {
      setIsTicketsLoading(false)
    }
  }

  const handleActivateSprint = async (sprintId: string) => {
    try {
      const response = await fetch(`/api/capacity-plan/${sprintId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      })

      if (response.ok) {
        // Refresh sprints
        await fetchActiveSprints()
      }
    } catch (error) {
      console.error('Failed to activate sprint:', error)
    }
  }

  const handleCreateTicket = () => {
    if (selectedSprint) {
      router.push(`/dashboard/capacity-plan?sprintId=${selectedSprint.id}`)
    }
  }

  const handleEditTicket = (ticketId: string) => {
    if (selectedSprint) {
      router.push(`/dashboard/capacity-plan?sprintId=${selectedSprint.id}&ticketId=${ticketId}`)
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!selectedSprint) return

    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      const response = await fetch(`/api/capacity-plan/${selectedSprint.id}/tickets/${ticketId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh tickets
        await fetchSprintTickets(selectedSprint.id)
      }
    } catch (error) {
      console.error('Failed to delete ticket:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Capacity Planning</h2>
        <p className="text-gray-600 mb-6">
          Manage capacity tickets for your active sprints. Select a sprint below to view and manage its tickets.
        </p>
      </div>

      {/* Active Sprints */}
      <div>
        <h3 className="text-lg font-medium mb-4">Active Sprints</h3>
        {sprints.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sprints</h3>
                <p className="text-gray-500 mb-4">
                  Activate a sprint from the Sprints tab to start capacity planning.
                </p>
                <Button onClick={() => router.push('/dashboard/scrum-master')}>
                  Go to Sprints
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sprints.map(sprint => (
              <Card
                key={sprint.id}
                className={`cursor-pointer transition-all ${
                  selectedSprint?.id === sprint.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedSprint(sprint)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {sprint.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {sprint.squad.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {sprint.status}
                      </Badge>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Sprint Tickets */}
      {selectedSprint && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Tickets for {selectedSprint.name}
            </h3>
            <Button
              onClick={() => handleActivateSprint(selectedSprint.id)}
              variant="outline"
              size="sm"
            >
              Sync with Jira
            </Button>
          </div>

          <CapacityPlanGrid
            tickets={tickets}
            onCreateTicket={handleCreateTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
            isLoading={isTicketsLoading}
          />
        </div>
      )}
    </div>
  )
}