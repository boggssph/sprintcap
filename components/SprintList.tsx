"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Sprint = {
  id: string
  name: string
  squadId: string
  squadName: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  memberCount: number
  createdAt: string
}

type SprintListProps = {
  refreshTrigger?: number
}

export default function SprintList({ refreshTrigger }: SprintListProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getSprintStatus = (sprint: Sprint) => {
    switch (sprint.status) {
      case 'ACTIVE':
        return { label: 'Active', variant: 'default' as const }
      case 'INACTIVE':
        return { label: 'Inactive', variant: 'secondary' as const }
      case 'COMPLETED':
        return { label: 'Completed', variant: 'outline' as const }
      default:
        return { label: 'Unknown', variant: 'secondary' as const }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sprints</CardTitle>
        <CardDescription>
          Overview of all sprints you've created for your squads.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sprints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No sprints created yet.</p>
            <p className="text-sm">Create your first sprint using the form above.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sprint Name</TableHead>
                <TableHead>Squad</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sprints.map((sprint) => {
                const status = getSprintStatus(sprint)
                return (
                  <TableRow key={sprint.id}>
                    <TableCell className="font-medium">{sprint.name}</TableCell>
                    <TableCell>{sprint.squadName}</TableCell>
                    <TableCell>{formatDate(sprint.startDate)}</TableCell>
                    <TableCell>{formatDate(sprint.endDate)}</TableCell>
                    <TableCell>{sprint.memberCount}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}