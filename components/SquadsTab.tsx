"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit } from 'lucide-react'
import SquadsEmptyState from './SquadsEmptyState'
import SquadCreationDrawer from './SquadCreationDrawer'
import SquadEditDrawer from './SquadEditDrawer'

/**
 * Squad interface representing a team with member information
 */
interface Squad {
  id: string
  name: string
  alias: string
  memberCount: number
  createdAt: string
  members?: Array<{
    id: string
    name: string
    joinedAt: string
  }>
}

/**
 * SquadsTab component displays a Scrum Master's squads in a vertical stack layout.
 * Each squad card shows the squad name, alias, member count, creation date, and a list of all members with their join dates.
 * Cards are displayed in a single vertical column with scrollable member lists for large squads.
 */

export default function SquadsTab() {
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null)

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
    fetchSquads()
    setDrawerOpen(false)
  }

  const handleEditSquad = (squad: Squad) => {
    setSelectedSquad(squad)
    setEditDrawerOpen(true)
  }

  const handleSquadUpdated = () => {
    fetchSquads()
    setEditDrawerOpen(false)
    setSelectedSquad(null)
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
        <div className="grid gap-4" data-testid="squads-list">
          {squads.map((squad) => (
            <Card key={squad.id} className="hover:shadow-md transition-shadow" data-testid="squad-card">
              <CardHeader data-testid="squad-card-header">
                <CardTitle className="flex items-center justify-between" data-testid="squad-card-title">
                  <span>{squad.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" data-testid="squad-card-alias">
                      {squad.alias}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSquad(squad)}
                      data-testid="edit-squad-button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="squad-card-content">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span data-testid="squad-member-count">
                    {squad.memberCount} {squad.memberCount === 1 ? 'member' : 'members'}
                  </span>
                  <span data-testid="squad-creation-date">
                    Created {new Date(squad.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Member List */}
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Members</div>
                  {squad.members && squad.members.length > 0 ? (
                    <div
                      className="max-h-32 overflow-y-auto space-y-1"
                      data-testid="squad-members-list"
                      role="list"
                      aria-label={`Members of ${squad.name} squad`}
                    >
                      {squad.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded"
                          data-testid="squad-member-item"
                          role="listitem"
                          aria-label={`${member.name} joined ${new Date(member.joinedAt).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          })}`}
                        >
                          <span data-testid="member-name">{member.name}</span>
                          <span data-testid="member-join-date">
                            {new Date(member.joinedAt).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-500 italic py-2"
                      data-testid="squad-no-members"
                    >
                      No members yet
                    </div>
                  )}
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

      {selectedSquad && (
        <SquadEditDrawer
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          squad={selectedSquad}
          onSquadUpdated={handleSquadUpdated}
        />
      )}
    </div>
  )
}