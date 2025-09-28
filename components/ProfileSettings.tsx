"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Save, X } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string | null
  displayName: string | null
  image: string | null
  role: string
  createdAt: string
}

export default function ProfileSettings() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data.user)
        setDisplayName(data.user.displayName || data.user.name || '')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
    setLoading(false)
  }

  const updateDisplayName = async () => {
    if (!displayName.trim()) {
      setMessage('Display name cannot be empty')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() })
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(data.user)
        setMessage('Display name updated successfully!')
        // Update the session to reflect the new display name
        await update({ displayName: data.user.displayName })
      } else {
        const error = await res.json()
        setMessage(error.error || 'Failed to update display name')
      }
    } catch (error) {
      console.error('Failed to update display name:', error)
      setMessage('Failed to update display name')
    }
    setSaving(false)
  }

  const cancelEdit = () => {
    setDisplayName(profile?.displayName || profile?.name || '')
    setMessage('')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading profile...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Failed to load profile
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentDisplayName = (session?.user as any)?.displayName || profile.name || 'No name set'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your account information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Overview */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.image || undefined} />
            <AvatarFallback className="text-lg">
              {currentDisplayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{currentDisplayName}</h3>
            <p className="text-gray-600">{profile.email}</p>
            <Badge variant="secondary" className="mt-1">
              {profile.role.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Display Name Editor */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <p className="text-sm text-gray-600 mb-2">
              This is the name that will be shown to other users. If not set, your Google account name will be used.
            </p>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                className="flex-1"
              />
              <Button
                onClick={updateDisplayName}
                disabled={saving || displayName.trim() === (profile.displayName || profile.name || '')}
                size="sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={cancelEdit}
                variant="outline"
                size="sm"
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {displayName !== (profile.displayName || profile.name || '') && (
              <p className="text-xs text-gray-500 mt-1">
                Click save to update your display name
              </p>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('successfully')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Account Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span>{profile.role.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}