"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type Sprint = {
  id: string
  name: string
  startDate: string
  endDate: string
  squadId: string
  squadName: string
  isActive: boolean
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

  const fetchSprints = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/sprints')
      if (res.ok) {
        const data = await res.json()
        setSprints(data.sprints || [])
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
  const sprintsBySquad = sprints.reduce((acc, sprint) => {
    const existing = acc.find(s => s.squadId === sprint.squadId)
    if (existing) {
      existing.sprints.push(sprint)
    } else {
      acc.push({
        squadId: sprint.squadId,
        squadName: sprint.squadName,
        sprints: [sprint]
      })
    }
    return acc
  }, [] as SquadSprints[])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      <div>{formatDate(sprint.startDate)}</div>
                      <div>to {formatDate(sprint.endDate)}</div>
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
