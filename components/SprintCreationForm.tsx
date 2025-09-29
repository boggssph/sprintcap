"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Squad = {
  id: string
  name: string
  alias?: string
  memberCount: number
}

type SprintCreationFormProps = {
  onSprintCreated?: () => void
}

export default function SprintCreationForm({ onSprintCreated }: SprintCreationFormProps) {
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSquads, setLoadingSquads] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    squadId: '',
    startDate: '',
    endDate: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      }
    } catch (error) {
      console.error('Failed to fetch squads:', error)
    } finally {
      setLoadingSquads(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Sprint name is required'
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

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          squadId: formData.squadId,
          startDate: formData.startDate,
          endDate: formData.endDate
        })
      })

      if (res.ok) {
        const data = await res.json()
        // Reset form
        setFormData({
          name: '',
          squadId: '',
          startDate: '',
          endDate: ''
        })
        // Notify parent component
        onSprintCreated?.()
      } else {
        const errorData = await res.json()
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Sprint</CardTitle>
          <CardDescription>Loading your squads...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sprint</CardTitle>
        <CardDescription>
          Create a sprint for one of your squads. All active squad members will be automatically added as sprint participants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sprint Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Sprint 2025.10"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
      </CardContent>
    </Card>
  )
}