"use client"
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DisplayNameEditor from '@/components/DisplayNameEditor'

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
    <main className="flex-1 flex flex-col items-center bg-white p-8">
      <header className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <DisplayNameEditor />
      </header>
      <section className="w-full max-w-2xl bg-gray-50 p-6 rounded-md shadow mb-6">
        <form onSubmit={handleSubmit} className="">
          <h2 className="text-2xl mb-4">Admin - Create Invite</h2>
          <label className="block mb-2 text-sm">Email</label>
          <input data-testid="invite-email-input" className="w-full mb-4 p-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="block mb-2 text-sm">Role</label>
          <select className="w-full mb-4 p-2 border rounded" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="MEMBER">Member</option>
            <option value="SCRUM_MASTER">Scrum Master</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="flex gap-2">
            <button data-testid="create-invite-btn" className="py-2 px-4 bg-black text-white rounded" disabled={loading}>{loading? 'Working...' : 'Create Invite'}</button>
            <button data-testid="refresh-invites-btn" type="button" className="py-2 px-4 bg-white border rounded" onClick={fetchInvites} disabled={refreshing}>{refreshing? 'Refreshing...' : 'Refresh'}</button>
          </div>
          {msg && <p className="mt-4 text-sm">{msg}</p>}
        </form>
      </section>

      <section className="w-full max-w-2xl">
        <h3 className="text-lg mb-2">Recent Invites</h3>
          <div className="p-4 flex gap-2 items-center">
            <input data-testid="search-invites-input" className="p-2 border rounded" placeholder="Search email" value={q} onChange={e=>setQ(e.target.value)} />
            <select className="p-2 border rounded" value={filterStatus || ''} onChange={e=>setFilterStatus(e.target.value || undefined)}>
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
            <button className="py-1 px-3 bg-gray-200 rounded" onClick={()=>{ setCursor(null); fetchInvites() }}>Apply</button>
          </div>
          <div className="bg-white border rounded">
          {invites.length === 0 && <div className="p-4 text-sm text-gray-500">No invites yet</div>}
          {invites.map(inv => (
            <div data-testid={`invite-row-${inv.id}`} key={inv.id} className="p-3 border-b flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{inv.email}</div>
                <div className="text-xs text-gray-500">Role: {inv.invitedRole || 'MEMBER'} • Expires: {new Date(inv.expiresAt).toLocaleString()} • Status: <span data-testid={`invite-status-${inv.id}`} className="font-semibold">{inv.status || 'PENDING'}</span></div>
              </div>
              <div className="flex gap-2">
                <button data-testid={`copy-link-${inv.id}`} className="py-1 px-2 bg-blue-600 text-white rounded text-sm" onClick={()=>handleCopy(inv)}>Copy Accept Link</button>
                {/** Revoke only shown for PENDING invites */}
                {inv && inv.status === 'PENDING' && (
                  <button data-testid={`revoke-btn-${inv.id}`} className="py-1 px-2 bg-red-600 text-white rounded text-sm" onClick={()=>setConfirming(inv)}>Revoke</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center">
          {nextCursor ? (
            <button className="py-1 px-3 bg-gray-800 text-white rounded" onClick={()=>{ setCursor(nextCursor); fetchInvites() }}>Load more</button>
          ) : null}
        </div>

        {/* Confirmation modal */}
        {confirming && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h4 className="text-lg mb-2">Revoke Invite</h4>
              <p className="text-sm mb-4">Are you sure you want to revoke the invite for <strong>{confirming.email}</strong>? This cannot be undone.</p>
                <div className="flex gap-2 justify-end">
                <button data-testid="modal-cancel" className="px-3 py-1 border rounded" onClick={()=>setConfirming(null)}>Cancel</button>
                <button data-testid="modal-revoke-confirm" className="px-3 py-1 bg-red-600 text-white rounded" onClick={async ()=>{
                  try{
                    const r = await fetch('/api/invite',{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'revoke', inviteId: confirming.id }) })
                    if (r.ok) {
                      setMsg('Invite revoked')
                      setConfirming(null)
                      await fetchInvites()
                    } else {
                      const e = await r.json()
                      setMsg('Error: ' + (e.error || 'revoke failed'))
                    }
                  } catch (e: unknown) {
                    if (e instanceof Error) {
                      setMsg('Error: ' + e.message)
                    } else {
                      setMsg('Error: Unknown error')
                    }
                  }
                }}>Revoke</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="w-full max-w-2xl mt-8">
        <h3 className="text-lg mb-4">Access Requests</h3>
        <div className="space-y-4">
          {accessRequests.map((request: AccessRequest) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{request.email}</p>
                  <p className="text-sm text-gray-600">{request.name}</p>
                  <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
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
            </Card>
          ))}
          {accessRequests.length === 0 && (
            <p className="text-gray-500 text-center py-8">No access requests found</p>
          )}
        </div>
      </section>

  {/* Footer removed, handled globally */}
    </main>
  )
}
