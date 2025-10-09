"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SquadsEmptyState from './SquadsEmptyState'
import SquadCreationDrawer from './SquadCreationDrawer'

interface Squad {
  id: string
  name: string
  alias: string
  memberCount: number
  createdAt: string
}

export default function SquadsTab() {
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchSquads = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/squads')

      if (response.ok) {
        const data = await response.json()
        setSquads(data.squads || [])
      } else if (response.status === 401) {
        setError('Authentication required')
      } else if (response.status === 403) {
        setError('Scrum Master role required')
      } else {
        setError('Failed to load squads')
      }
    } catch (err) {
      console.error('Error fetching squads:', err)
      setError('Failed to load squads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSquads()
  }, [])

  const handleSquadCreated = () => {
    fetchSquads() // Refresh the list
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Squads</h2>
          <Button disabled>Loading...</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Squads</h2>
          <Button onClick={() => setDrawerOpen(true)}>
            Create New Squad
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium mb-2">Error loading squads</p>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchSquads}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Squads</h2>
        <Button onClick={() => setDrawerOpen(true)}>
          Create New Squad
        </Button>
      </div>

      {squads.length === 0 ? (
        <SquadsEmptyState onCreateSquad={() => setDrawerOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {squads.map((squad) => (
            <Card key={squad.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{squad.name}</span>
                  <Badge variant="secondary">
                    {squad.alias}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {squad.memberCount} {squad.memberCount === 1 ? 'member' : 'members'}
                  </span>
                  <span>
                    Created {new Date(squad.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SquadCreationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSquadCreated={handleSquadCreated}
      />
    </div>
  )
}