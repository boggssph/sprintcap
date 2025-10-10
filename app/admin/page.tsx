"use client"
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Users, Shield, Copy } from 'lucide-react'
import CenteredContainer from '@/components/CenteredContainer'
import MainShell from '@/components/MainShell'
import AdminHeader from '@/components/AdminHeader'

type Invite = {
  id: string
  email: string
  invitedRole?: string | null
  expiresAt: string
  createdAt: string
  status?: string
}

type AccessRequest = {
  id: string
  email: string
  name?: string | null
  requestedRole: string
  status: string
  createdAt: string
}

export default function AdminPage(){
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [refreshing, setRefreshing] = useState(false)
  // const router = useRouter() // unused

  async function fetchInvites(){
    setRefreshing(true)
    try{
      const params = new URLSearchParams()
      params.set('limit','20')
      if (filterStatus) params.set('status', filterStatus)
      if (q) params.set('q', q)
      if (cursor) params.set('cursor', cursor)
      const res = await fetch('/api/invite?' + params.toString())
      if (res.ok) {
        const data = await res.json()
        setInvites(data.invites || [])
        setNextCursor(data.nextCursor || null)
      }
    }catch(e){
      console.warn('failed to fetch invites', e)
    }
    setRefreshing(false)
  }

  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined)
  const [q, setQ] = useState<string>('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<Invite | null>(null)

  useEffect(()=>{ fetchInvites(); fetchAccessRequests() }, [])

  async function fetchAccessRequests(){
    try{
      const res = await fetch('/api/access-requests')
      if (res.ok) {
        const data = await res.json()
        setAccessRequests(data.requests || [])
      }
    }catch(e){
      console.warn('failed to fetch access requests', e)
    }
  }

  async function handleAccessRequest(requestId: string, action: 'approve' | 'decline'){
    try{
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      })
      if (res.ok) {
        await fetchAccessRequests()
      }
    }catch(e){
      console.warn('failed to process access request', e)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
      if (res.ok) {
        const data = await res.json()
        setMsg('Invite created: ' + data.id)
        setEmail('')
        // show accept token link for immediate copy
  const acceptUrl = typeof window !== 'undefined' ? `${window.location.origin}/accept-invite?token=${data.token}` : ''
  if (acceptUrl) navigator.clipboard?.writeText(acceptUrl)
        await fetchInvites()
      } else {
        const err = await res.json()
        setMsg('Error: ' + (err.error || 'unknown'))
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMsg('Error: ' + e.message)
      } else {
        setMsg('Error: Unknown error')
      }
    }
    setLoading(false)
  }

  async function handleCopy(invite: Invite){
    // we need a plain token; server doesn't store it. call regenerate to get a token copy
    try{
      const res = await fetch('/api/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'regenerate', inviteId: invite.id }) })
      if (!res.ok) throw new Error('failed to regenerate')
      const data = await res.json()
  const acceptUrl = typeof window !== 'undefined' ? `${window.location.origin}/accept-invite?token=${data.token}` : ''
  if (acceptUrl) await navigator.clipboard.writeText(acceptUrl)
      setMsg('Copied accept link to clipboard')
      await fetchInvites()
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMsg('Error copying link: ' + e.message)
      } else {
        setMsg('Error copying link: Unknown error')
      }
    }
  }

  return (
    <MainShell>
      <CenteredContainer>
        <AdminHeader />
        <Tabs defaultValue="invites" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Invites
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Access Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invites" className="space-y-6">
            {/* Create Invite Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Invite</CardTitle>
                <CardDescription>Send invitations for new team members</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      data-testid="invite-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Combobox
                      options={[
                        { label: "Member", value: "MEMBER" },
                        { label: "Scrum Master", value: "SCRUM_MASTER" },
                        { label: "Admin", value: "ADMIN" },
                      ]}
                      value={role}
                      onValueChange={setRole}
                      placeholder="Select role"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Invite'}
                    </Button>
                    <Button type="button" variant="outline" onClick={fetchInvites} disabled={refreshing}>
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </div>
                  {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
                </form>
              </CardContent>
            </Card>

            {/* Invites List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invites</CardTitle>
                <CardDescription>Manage sent invitations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex gap-2">
                    <Input
                      data-testid="search-invites-input"
                      placeholder="Search email"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    <Combobox
                      options={[
                        { label: "All", value: "" },
                        { label: "Pending", value: "PENDING" },
                        { label: "Accepted", value: "ACCEPTED" },
                        { label: "Expired", value: "EXPIRED" },
                      ]}
                      value={filterStatus || ''}
                      onValueChange={(value) => setFilterStatus(value || undefined)}
                      placeholder="All"
                      className="w-32"
                    />
                    <Button onClick={() => { setCursor(null); fetchInvites() }}>Apply</Button>
                  </div>

                  {/* Invites */}
                  <div className="space-y-2">
                    {invites.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No invites found</p>
                    ) : (
                      invites.map((inv) => (
                        <div
                          data-testid={`invite-row-${inv.id}`}
                          key={inv.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{inv.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Role: {inv.invitedRole || 'MEMBER'} • Expires: {new Date(inv.expiresAt).toLocaleString()} • Status: {' '}
                              <Badge variant={inv.status === 'ACCEPTED' ? 'default' : inv.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                {inv.status || 'PENDING'}
                              </Badge>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleCopy(inv)}>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Link
                            </Button>
                            {inv.status === 'PENDING' && (
                              <Button size="sm" variant="destructive" onClick={() => setConfirming(inv)}>
                                Revoke
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Load More */}
                  {nextCursor && (
                    <div className="text-center">
                      <Button onClick={() => { setCursor(nextCursor); fetchInvites() }}>
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Requests</CardTitle>
                <CardDescription>Review and approve access requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessRequests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No access requests found</p>
                  ) : (
                    accessRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{request.email}</p>
                          <p className="text-sm text-muted-foreground">{request.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {request.requestedRole} • {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'secondary' : 'destructive'}>
                            {request.status}
                          </Badge>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAccessRequest(request.id, 'approve')}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAccessRequest(request.id, 'decline')}>
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Modal */}
        {confirming && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Revoke Invite</CardTitle>
                <CardDescription>
                  Are you sure you want to revoke the invite for <strong>{confirming.email}</strong>? This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setConfirming(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        const r = await fetch('/api/invite', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'revoke', inviteId: confirming.id })
                        })
                        if (r.ok) {
                          setMsg('Invite revoked')
                          setConfirming(null)
                          await fetchInvites()
                        } else {
                          const e = await r.json()
                          setMsg('Error: ' + (e.error || 'revoke failed'))
                        }
                      } catch (e) {
                        setMsg('Error: ' + (e instanceof Error ? e.message : 'Unknown error'))
                      }
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CenteredContainer>
    </MainShell>
  )
}
