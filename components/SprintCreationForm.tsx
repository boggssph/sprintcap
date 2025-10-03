"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

type Squad = {
  id: string
  name: string
  alias?: string
  memberCount: number
}

type Member = {
  id: string
  email: string
  name: string
}

type SprintCreationFormProps = {
  onSprintCreated?: () => void
  inDialog?: boolean
}

export default function SprintCreationForm({ onSprintCreated, inDialog = false }: SprintCreationFormProps) {
  const [squads, setSquads] = useState<Squad[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSquads, setLoadingSquads] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [formData, setFormData] = useState({
    sprintNumber: '',
    squadId: '',
    startDate: '',
    endDate: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get selected squad
  const selectedSquad = squads.find(squad => squad.id === formData.squadId)
  
  // Compute full sprint name
  const fullSprintName = selectedSquad?.alias && formData.sprintNumber.trim() 
    ? `${selectedSquad.alias}-Sprint-${formData.sprintNumber.trim()}`
    : ''

  // Fetch user's squads on component mount
  useEffect(() => {
    fetchSquads()
  }, [])

  const fetchSquads = async () => {
    try {
      const res = await fetch('/api/squads')
      if (res.ok) {
        const data = await res.json()
        setSquads(data.squads || [])
      } else {
        console.error('Failed to fetch squads:', res.status, res.statusText)
        setErrors({ submit: 'Failed to load squads. Please refresh the page.' })
      }
    } catch (error) {
      console.error('Failed to fetch squads:', error)
      setErrors({ submit: 'Network error. Please check your connection.' })
    } finally {
      setLoadingSquads(false)
    }
  }

  const fetchMembers = async (squadId: string) => {
    if (!squadId) {
      setMembers([])
      return
    }

    setLoadingMembers(true)
    try {
      const res = await fetch(`/api/squads/${squadId}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      } else {
        console.error('Failed to fetch members:', res.status, res.statusText)
        setMembers([])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
      setMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  // Fetch members when squad changes
  useEffect(() => {
    fetchMembers(formData.squadId)
  }, [formData.squadId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.sprintNumber.trim()) {
      newErrors.sprintNumber = 'Sprint number is required'
    }

    if (!formData.squadId) {
      newErrors.squadId = 'Please select a squad'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (end <= start) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', formData)

    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    console.log('Form validation passed, submitting...')
    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fullSprintName,
          squadId: formData.squadId,
          startDate: formData.startDate,
          endDate: formData.endDate
        })
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Sprint created successfully:', data)
        // Reset form
        setFormData({
          sprintNumber: '',
          squadId: '',
          startDate: '',
          endDate: ''
        })
        // Notify parent component
        onSprintCreated?.()
      } else {
        const errorData = await res.json()
        console.error('API error:', errorData)
        setErrors({ submit: errorData.error || 'Failed to create sprint' })
      }
    } catch (error) {
      console.error('Failed to create sprint:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (loadingSquads) {
    return inDialog ? (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading squads...</p>
      </div>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>Create New Sprint</CardTitle>
          <CardDescription>Loading your squads...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return inDialog ? (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="squad">Squad</Label>
        <Select value={formData.squadId} onValueChange={(value) => handleInputChange('squadId', value)}>
          <SelectTrigger className={errors.squadId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a squad" />
          </SelectTrigger>
          <SelectContent>
            {squads.map((squad) => (
              <SelectItem key={squad.id} value={squad.id}>
                {squad.name} {squad.alias ? `(${squad.alias})` : ''} - {squad.memberCount} members
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.squadId && <p className="text-sm text-red-500">{errors.squadId}</p>}
      </div>

      {formData.squadId && (
        <div className="space-y-2">
          <Label>Members ({members.length})</Label>
          <div className="border rounded-md p-3 bg-gray-50 min-h-[100px]">
            {loadingMembers ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                <span className="text-sm text-gray-600">Loading members...</span>
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-1">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <span>{member.name || member.email}</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No members found in this squad.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="sprintNumber">Sprint Number</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            {selectedSquad?.alias ? `${selectedSquad.alias}-Sprint-` : 'Select squad first'}
          </span>
          <Input
            id="sprintNumber"
            type="text"
            placeholder={selectedSquad?.alias ? "e.g., 1, 2, 2025.10" : ""}
            value={formData.sprintNumber}
            onChange={(e) => handleInputChange('sprintNumber', e.target.value)}
            className={`pl-32 ${errors.sprintNumber ? 'border-red-500' : ''}`}
            disabled={!selectedSquad?.alias}
          />
        </div>
        {errors.sprintNumber && <p className="text-sm text-red-500">{errors.sprintNumber}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date & Time</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date & Time</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating Sprint...' : 'Create Sprint'}
      </Button>
    </form>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sprint</CardTitle>
        <CardDescription>
          Create a sprint for one of your squads. All active squad members will be automatically added as sprint participants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {squads.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">No squads available. Please contact an administrator to create a squad for you.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprintNumber">Sprint Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                {selectedSquad?.alias ? `${selectedSquad.alias}-Sprint-` : 'Select squad first'}
              </span>
              <Input
                id="sprintNumber"
                type="text"
                placeholder={selectedSquad?.alias ? "e.g., 1, 2, 2025.10" : ""}
                value={formData.sprintNumber}
                onChange={(e) => handleInputChange('sprintNumber', e.target.value)}
                className={`pl-32 ${errors.sprintNumber ? 'border-red-500' : ''}`}
                disabled={!selectedSquad?.alias}
              />
            </div>
            {errors.sprintNumber && <p className="text-sm text-red-500">{errors.sprintNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="squad">Squad</Label>
            <Select value={formData.squadId} onValueChange={(value) => handleInputChange('squadId', value)}>
              <SelectTrigger className={errors.squadId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a squad" />
              </SelectTrigger>
              <SelectContent>
                {squads.map((squad) => (
                  <SelectItem key={squad.id} value={squad.id}>
                    {squad.name} {squad.alias ? `(${squad.alias})` : ''} - {squad.memberCount} members
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.squadId && <p className="text-sm text-red-500">{errors.squadId}</p>}
          </div>

          {formData.squadId && (
            <div className="space-y-2">
              <Label>Members ({members.length})</Label>
              <div className="border rounded-md p-3 bg-gray-50 min-h-[100px]">
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    <span className="text-sm text-gray-600">Loading members...</span>
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-1">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <span>{member.name || member.email}</span>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No members found in this squad.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Sprint...' : 'Create Sprint'}
          </Button>
        </form>
        )}
      </CardContent>
    </Card>
  )
}