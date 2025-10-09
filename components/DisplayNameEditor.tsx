"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Loader2 } from 'lucide-react'

export default function DisplayNameEditor() {
  const { data: session, update } = useSession()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const currentDisplayName = typeof session?.user === 'object' && session?.user !== null
    ? ('displayName' in session.user ? (session.user as { displayName?: string }).displayName : undefined) || ('name' in session.user ? (session.user as { name?: string }).name : undefined) || 'No name'
    : 'No name'

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setDisplayName(currentDisplayName)
      setError('')
    }
    setOpen(newOpen)
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Display name cannot be empty')
      return
    }

    if (displayName.length > 50) {
      setError('Display name must be less than 50 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() })
      })

      if (res.ok) {
        // Update the session with the new display name
        await update({ displayName: displayName.trim() })
        setOpen(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update display name')
      }
    } catch (error) {
      console.error('Failed to update display name:', error)
      setError('Failed to update display name')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 hover:bg-slate-100"
          title="Edit display name"
          data-testid="edit-display-name"
        >
          <Pencil className="h-3 w-3" />
          <span className="sr-only">Edit display name</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="display-name-dialog">
        <DialogHeader>
          <DialogTitle>Edit Display Name</DialogTitle>
          <DialogDescription>
            Update your display name. This will be shown throughout the application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="displayName" className="text-right">
              Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="col-span-3"
              placeholder="Enter your display name"
              maxLength={50}
              disabled={loading}
              data-testid="display-name-input"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded col-span-4" data-testid="display-name-error">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || displayName.trim() === currentDisplayName}
            data-testid="save-display-name"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}