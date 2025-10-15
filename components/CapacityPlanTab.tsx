"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Calendar, CheckCircle, Plus } from "lucide-react"
import CapacityPlanTable from "./CapacityPlanTable"
import TicketCreationDrawer from "./TicketCreationDrawer"
import { useRouter } from "next/navigation"
import MemberHoursTable from "./MemberHoursTable"

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
    members: Array<{
      user: {
        id: string
        displayName: string | null
        name: string | null
        email: string
      }
    }>
  }
}

interface Ticket {
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

export default function CapacityPlanTab() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isTicketsLoading, setIsTicketsLoading] = useState(false)
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
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
    }
  }

  const fetchSprintTickets = async (sprintId: string) => {
    setIsTicketsLoading(true)
    try {
      const response = await fetch(`/api/sprints/${sprintId}/tickets`)
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

  const handleCreateTicket = () => {
    setIsCreateDrawerOpen(true)
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
      const response = await fetch(`/api/sprints/${selectedSprint.id}/tickets/${ticketId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh tickets after deletion
        fetchSprintTickets(selectedSprint.id)
      } else {
        console.error('Failed to delete ticket')
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Capacity Planning</h2>
        <p className="text-gray-600 mb-6">
          Manage capacity tickets for your enabled sprints. Select a sprint below to view and manage its tickets.
        </p>
      </div>

      {/* Enabled Sprints */}
      <div>
        <h3 className="text-lg font-medium mb-4">Enabled Sprints</h3>
        {sprints.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Enabled Sprints</h3>
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
                      <Badge 
                        variant={sprint.status === 'ACTIVE' ? 'default' : sprint.status === 'COMPLETED' ? 'secondary' : 'outline'}
                        className={`text-xs ${
                          sprint.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' :
                          sprint.status === 'COMPLETED' ? 'bg-blue-500 hover:bg-blue-600' :
                          'bg-gray-500 hover:bg-gray-600'
                        }`}
                      >
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
          {/* Member Hours Table */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Member Hours</h3>
            <MemberHoursTable sprintId={selectedSprint.id} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Tickets for {selectedSprint.name}
            </h3>
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateTicket}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket
            </Button>
          </div>

          <CapacityPlanTable
            tickets={tickets}
            onCreateTicket={handleCreateTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
            isLoading={isTicketsLoading}
          />
        </div>
      )}

      {/* Create Ticket Drawer */}
      {selectedSprint && (
        <TicketCreationDrawer
          open={isCreateDrawerOpen}
          onOpenChange={setIsCreateDrawerOpen}
          sprintId={selectedSprint.id}
          squadMembers={selectedSprint.squad.members
            .map(member => ({
              id: member.user.id,
              displayName: member.user.displayName || member.user.name || member.user.email,
            }))}
          onTicketCreated={() => {
            // Refresh tickets after creation
            fetchSprintTickets(selectedSprint.id)
          }}
        />
      )}
    </div>
  )
}