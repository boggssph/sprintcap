"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Copy } from 'lucide-react'

interface Squad {
  id: string
  name: string
  alias: string
  memberCount: number
}

interface Invite {
  id: string
  email: string
  expiresAt: string
  createdAt: string
  status?: string
  squadId?: string | null
}

export default function InvitesTab() {
  const [squads, setSquads] = useState<Squad[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedSquadId, setSelectedSquadId] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)

  const fetchSquads = async () => {
    try {
      const response = await fetch('/api/squads')
      if (response.ok) {
        const data = await response.json()
        setSquads(data.squads || [])
      }
    } catch (err) {
      console.error('Error fetching squads:', err)
    }
  }

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites')
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites || [])
      }
    } catch (err) {
      console.error('Error fetching invites:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchSquads(), fetchInvites()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !selectedSquadId) {
      setMessage('Please enter an email and select a squad')
      return
    }

    setCreating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitedEmail: email.trim(),
          squadId: selectedSquadId,
          invitedRole: 'MEMBER'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage('Invite created successfully!')
        setEmail('')
        setSelectedSquadId('')

        // Copy invite link to clipboard
        const acceptUrl = `${window.location.origin}/accept-invite?token=${data.token}&email=${encodeURIComponent(email.trim())}`
        await navigator.clipboard.writeText(acceptUrl)

        await fetchInvites()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error || 'Failed to create invite'}`)
      }
    } catch (err) {
      console.error('Error creating invite:', err)
      setMessage('Failed to create invite')
    } finally {
      setCreating(false)
    }
  }

  const handleCopyInviteLink = async (invite: Invite) => {
    try {
      // Regenerate token to get a fresh link
      const response = await fetch(`/api/invites/${invite.id}/regenerate`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        const acceptUrl = `${window.location.origin}/accept-invite?token=${data.token}&email=${encodeURIComponent(invite.email)}`
        await navigator.clipboard.writeText(acceptUrl)
        setMessage('Invite link copied to clipboard!')
        await fetchInvites()
      } else {
        setMessage('Failed to copy invite link')
      }
    } catch (err) {
      console.error('Error copying invite link:', err)
      setMessage('Failed to copy invite link')
    }
  }

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'PENDING': return 'default'
      case 'ACCEPTED': return 'secondary'
      case 'EXPIRED': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Invites</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invites</h2>
        <Button onClick={fetchData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Create Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team.member@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="invite-squad">Squad</Label>
              <Combobox
                options={squads.map((squad) => ({
                  label: `${squad.name} (${squad.alias}) - ${squad.memberCount} members`,
                  value: squad.id
                }))}
                value={selectedSquadId}
                onValueChange={setSelectedSquadId}
                placeholder="Select a squad"
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating Invite...' : 'Send Invite'}
            </Button>
          </form>
          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sent Invites
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No invites sent yet</p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invite.email}</span>
                      <Badge variant={getStatusBadgeVariant(invite.status)}>
                        {invite.status || 'UNKNOWN'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Sent {new Date(invite.createdAt).toLocaleDateString()} •
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  {invite.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyInviteLink(invite)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Link
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}