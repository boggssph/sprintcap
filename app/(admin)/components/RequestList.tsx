"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/table'

type RequestItem = { id: string, email: string, name?: string, message?: string, status?: string, createdAt?: string }

export default function RequestList(){
  const [items, setItems] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function load(cursor?: string | null){
    try {
      setLoading(true)
      const url = cursor ? `/api/admin/requests?cursor=${encodeURIComponent(cursor)}` : '/api/admin/requests'
      const res = await fetch(url)
      const j = await res.json()
      const newItems = j.items || []
      setItems(prev => cursor ? [...prev, ...newItems] : newItems)
      setNextCursor(j.nextCursor || null)
      setLoading(false)
    } catch (e) {
      setError('Failed to load')
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  async function confirmConvert(){
    if (!confirmId) return
    try {
      const res = await fetch('/api/admin/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: confirmId, role: 'MEMBER' }) })
      if (!res.ok) throw new Error('bad')
      setItems(prev => prev.filter(it => it.id !== confirmId))
      setConfirmId(null)
    } catch (e) {
      setError('Failed to convert')
    }
  }

  if (loading && items.length === 0) return <div data-testid="request-list-loading">Loading…</div>
  if (error) return <div data-testid="request-list-error">{error}</div>

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white rounded shadow-sm">
        <Table data-testid="request-list-table">
          <TableHeader>
            <tr>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {items.map(it => (
              <TableRow key={it.id} className="odd:bg-gray-50" data-testid={`request-row-${it.id}`}>
                <TableCell>{it.email}</TableCell>
                <TableCell>{it.name || ''}</TableCell>
                <TableCell>{it.message || ''}</TableCell>
                <TableCell>
                  <Button data-testid={`convert-${it.id}`} onClick={()=>setConfirmId(it.id)}>Convert</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {nextCursor && <div className="flex justify-center"><Button data-testid="load-more" variant="outline" onClick={()=>load(nextCursor)}>Load more</Button></div>}

      <Dialog open={!!confirmId} onOpenChange={(open)=>{ if (!open) setConfirmId(null) }}>
    <DialogContent data-testid="confirm-modal">
          <DialogHeader>
            <DialogTitle>Convert request</DialogTitle>
            <DialogDescription>Convert request to invite?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button data-testid="confirm-cancel" variant="outline" onClick={()=>setConfirmId(null)}>Cancel</Button>
            <Button data-testid="confirm-yes" variant="destructive" onClick={confirmConvert}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
