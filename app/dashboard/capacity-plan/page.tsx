"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Target, Users, Calendar } from "lucide-react"
import CapacityPlanTable from "@/components/CapacityPlanTable"
import ScrumMasterHeader from "@/components/ScrumMasterHeader"
import CenteredContainer from '@/components/CenteredContainer'
import MainShell from '@/components/MainShell'

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

export default function CapacityPlanPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sprintId = searchParams.get('sprintId')

  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTicketsLoading, setIsTicketsLoading] = useState(false)

  // Fetch sprint details and tickets on mount
  useEffect(() => {
    if (sprintId) {
      fetchSprintDetails()
      fetchSprintTickets()
    } else {
      setIsLoading(false)
    }
  }, [sprintId])

  const fetchSprintDetails = async () => {
    if (!sprintId) return

    try {
      // For now, we'll fetch from active sprints and find the matching one
      const response = await fetch('/api/capacity-plan/active-sprints')
      if (response.ok) {
        const data = await response.json()
        const foundSprint = data.sprints.find((s: Sprint) => s.id === sprintId)
        if (foundSprint) {
          setSprint(foundSprint)
        }
      }
    } catch (error) {
      console.error('Failed to fetch sprint details:', error)
    }
  }

  const fetchSprintTickets = async () => {
    if (!sprintId) return

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
    // Navigate to create ticket mode (could open a modal or form)
    router.push(`/dashboard/capacity-plan?sprintId=${sprintId}&action=create`)
  }

  const handleEditTicket = (ticketId: string) => {
    router.push(`/dashboard/capacity-plan?sprintId=${sprintId}&ticketId=${ticketId}&action=edit`)
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!sprintId) return

    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      const response = await fetch(`/api/sprints/${sprintId}/tickets/${ticketId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchSprintTickets()
      } else {
        console.error('Failed to delete ticket')
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  const handleBack = () => {
    router.push('/dashboard/scrum-master')
  }

  if (isLoading) {
    return (
      <MainShell>
        <CenteredContainer>
          <ScrumMasterHeader />
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
              ))}
            </div>
          </div>
        </CenteredContainer>
      </MainShell>
    )
  }

  if (!sprintId || !sprint) {
    return (
      <MainShell>
        <CenteredContainer>
          <ScrumMasterHeader />
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sprint Not Found</h2>
            <p className="text-gray-500 mb-6">
              The requested sprint could not be found or you don't have access to it.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CenteredContainer>
      </MainShell>
    )
  }

  return (
    <MainShell>
      <CenteredContainer>
        <ScrumMasterHeader />

        {/* Sprint Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {sprint.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Squad:</span> {sprint.squad.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Duration:</span>{' '}
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {sprint.status}
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Grid */}
        <CapacityPlanTable
          tickets={tickets}
          onCreateTicket={handleCreateTicket}
          onEditTicket={handleEditTicket}
          onDeleteTicket={handleDeleteTicket}
          isLoading={isTicketsLoading}
        />
      </CenteredContainer>
    </MainShell>
  )
}