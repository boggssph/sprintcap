"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'

export default function RequestAccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [providerId, setProviderId] = useState('')
  const [requestedRole, setRequestedRole] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = searchParams
    if (!params) return

    const emailParam = params.get('email') || ''
    const nameParam = params.get('name') || ''
    const imageParam = params.get('image') || ''
    const providerIdParam = params.get('providerId') || ''

    setEmail(emailParam)
    setName(nameParam)
    setImage(imageParam)
    setProviderId(providerIdParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedRole) {
      setError('Please select a role')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          image,
          providerId,
          requestedRole,
        }),
      })

      if (response.ok) {
        // Redirect to a success page or show success message
        router.push('/auth/request-submitted')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit request')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Redirect back to home or sign out
    router.push('/')
  }

  return (
    <div className="flex-1 bg-white flex items-center justify-center p-4">
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-center">User not registered</DialogTitle>
            <DialogDescription className="text-center">
              Your account is not registered in our system. Please request access below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Requested Role</Label>
              <Combobox
                options={[
                  { label: "Scrum Master", value: "SCRUM_MASTER" },
                  { label: "Squad Member", value: "MEMBER" },
                ]}
                value={requestedRole}
                onValueChange={setRequestedRole}
                placeholder="Select a role"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Request Access'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}