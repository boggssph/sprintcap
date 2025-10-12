"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Plus, Play, Edit } from 'lucide-react'
import { SprintUpdateDrawer } from './SprintUpdateDrawer'

type Sprint = {
  id: string
  name: string
  startDate: string
  endDate: string
  squadId: string
  squadName: string
  isActive: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  isEnabledForCapacity?: boolean
}

type ApiSprintResponse = {
  id: string
  name: string
  startDate: string
  endDate: string
  squadId: string
  squadName: string
  isActive: boolean
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

type SquadSprints = {
  squadId: string
  squadName: string
  sprints: Sprint[]
}

type SprintListProps = {
  refreshTrigger?: number
  onCreateSprint?: () => void
  onSprintSelected?: (sprintId: string) => void
}

export default function SprintList({ refreshTrigger, onCreateSprint, onSprintSelected }: SprintListProps) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enablingSprintId, setEnablingSprintId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const fetchSprints = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/sprints')
      if (res.ok) {
        const data = await res.json()
        // Fetch capacity planning status for each sprint
        const sprintsWithCapacityStatus = await Promise.all(
          (data.sprints || []).map(async (sprint: ApiSprintResponse) => {
            try {
              const capacityRes = await fetch(`/api/capacity-plan/${sprint.id}/status`)
              if (capacityRes.ok) {
                const capacityData = await capacityRes.json()
                return { 
                  ...sprint, 
                  isEnabledForCapacity: capacityData.isEnabled || false,
                  status: sprint.status || 'INACTIVE'
                }
              }
            } catch (error) {
              console.error(`Failed to fetch capacity status for sprint ${sprint.id}:`, error)
            }
            return { 
              ...sprint, 
              isEnabledForCapacity: false,
              status: sprint.status || 'INACTIVE'
            }
          })
        )
        setSprints(sprintsWithCapacityStatus)
      } else {
        setError('Failed to load sprints')
      }
    } catch (error) {
      console.error('Failed to fetch sprints:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSprints()
  }, [refreshTrigger])

  // Group sprints by squad
  const sprintsBySquad = React.useMemo(() => {
    const grouped: { [key: string]: SquadSprints } = {}
    
    sprints.forEach(sprint => {
      if (!grouped[sprint.squadId]) {
        grouped[sprint.squadId] = {
          squadId: sprint.squadId,
          squadName: sprint.squadName,
          sprints: []
        }
      }
      grouped[sprint.squadId].sprints.push(sprint)
    })
    
    return Object.values(grouped)
  }, [sprints])

  const handleEnableSprint = async (sprintId: string) => {
    setEnablingSprintId(sprintId)
    try {
      const response = await fetch(`/api/capacity-plan/${sprintId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      })

      if (response.ok) {
        // Refresh sprints to show updated status
        await fetchSprints()
      } else {
        console.error('Failed to enable sprint for capacity planning')
      }
    } catch (error) {
      console.error('Failed to enable sprint:', error)
    } finally {
      setEnablingSprintId(null)
    }
  }

  const handleStatusChange = async (sprintId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sprints/${sprintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Refresh sprints to show updated status
        await fetchSprints()
      } else {
        console.error('Failed to update sprint status')
      }
    } catch (error) {
      console.error('Failed to update sprint status:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Sprints</CardTitle>
          <CardDescription>Loading sprints...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Sprints</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchSprints} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (sprintsBySquad.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Sprints</CardTitle>
          <CardDescription>No sprints found. Create your first sprint to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCreateSprint} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Create New Sprint
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Sprints</h2>
          <p className="text-muted-foreground">Manage sprints across all your squads</p>
        </div>
        <Button onClick={onCreateSprint}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Sprint
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {sprintsBySquad.map((squad) => (
          <Card key={squad.squadId} data-testid={`squad-card-${squad.squadId}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {squad.squadName}
                <Badge variant="secondary">{squad.sprints.length} sprint{squad.sprints.length !== 1 ? 's' : ''}</Badge>
              </CardTitle>
              <CardDescription>Recent sprints for this squad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {squad.sprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className={`flex items-center justify-between p-3 rounded-lg border bg-muted/50 ${
                      onSprintSelected ? 'cursor-pointer hover:bg-muted transition-colors' : ''
                    }`}
                    data-testid={`sprint-card-${sprint.id}`}
                    onClick={() => onSprintSelected?.(sprint.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sprint.name}</span>
                        {sprint.isActive && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                        {sprint.isEnabledForCapacity && (
                          <Badge variant="secondary" className="text-xs">Capacity Planning</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <RadioGroup
                          value={sprint.status || 'INACTIVE'}
                          onValueChange={(value) => handleStatusChange(sprint.id, value)}
                          className="flex flex-row gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="INACTIVE" id={`inactive-${sprint.id}`} />
                            <Label htmlFor={`inactive-${sprint.id}`} className="text-xs cursor-pointer">INACTIVE</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ACTIVE" id={`active-${sprint.id}`} />
                            <Label htmlFor={`active-${sprint.id}`} className="text-xs cursor-pointer">ACTIVE</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="COMPLETED" id={`completed-${sprint.id}`} />
                            <Label htmlFor={`completed-${sprint.id}`} className="text-xs cursor-pointer">COMPLETED</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground text-right">
                        <div>{formatDate(sprint.startDate)}</div>
                        <div>to {formatDate(sprint.endDate)}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <SprintUpdateDrawer
                          sprint={sprint}
                          onSuccess={fetchSprints}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </SprintUpdateDrawer>
                        {!sprint.isEnabledForCapacity && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEnableSprint(sprint.id)
                            }}
                            disabled={enablingSprintId === sprint.id}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {enablingSprintId === sprint.id ? 'Enabling...' : 'Enable'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
