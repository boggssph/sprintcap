"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '@/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

interface SprintCreationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSprintCreated?: () => void
}

interface Squad {
  id: string
  name: string
  alias: string
}

interface SprintFormData {
  name: string
  squadId: string
  startDate: string
  endDate: string
}

export default function SprintCreationDrawer({
  open,
  onOpenChange,
  onSprintCreated
}: SprintCreationDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [squads, setSquads] = useState<Squad[]>([])

  const form = useForm<SprintFormData>({
    defaultValues: {
      name: '',
      squadId: '',
      startDate: '',
      endDate: ''
    }
  })

  // Fetch squads when drawer opens
  useEffect(() => {
    if (open) {
      fetchSquads()
    }
  }, [open])

  const fetchSquads = async () => {
    try {
      const response = await fetch('/api/squads')
      if (response.ok) {
        const data = await response.json()
        setSquads(data.squads || [])
      }
    } catch (error) {
      console.error('Failed to fetch squads:', error)
    }
  }

  const onSubmit = async (data: SprintFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Sprint created successfully!')
        form.reset()
        onOpenChange(false)
        onSprintCreated?.()
      } else {
        const errorData = await response.json()
        if (response.status === 400 && errorData.details) {
          // Handle validation errors
          Object.entries(errorData.details).forEach(([field, message]) => {
            form.setError(field as keyof SprintFormData, {
              message: message as string
            })
          })
        } else {
          toast.error(errorData.message || 'Failed to create sprint')
        }
      }
    } catch (error) {
      console.error('Error creating sprint:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Drawer open={open} onOpenChange={onOpenChange} data-testid="sprint-creation-drawer">
      <DrawerContent className="max-h-[90vh] lg:max-w-screen-md lg:mx-auto" data-testid="sprint-drawer-content">
        <DrawerHeader>
          <DrawerTitle>Create New Sprint</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Sprint name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sprint 2025.01"
                        {...field}
                        data-testid="sprint-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="squadId"
                rules={{ required: 'Please select a squad' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Squad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="sprint-squad-dropdown">
                          <SelectValue placeholder="Select a squad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {squads.map((squad) => (
                          <SelectItem key={squad.id} value={squad.id}>
                            {squad.name} ({squad.alias})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={today}
                          {...field}
                          data-testid="sprint-start-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={form.watch('startDate') || today}
                          {...field}
                          data-testid="sprint-end-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-6 mt-6 border-t">
                <DrawerClose asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit" className="flex-1" disabled={isSubmitting} data-testid="sprint-submit-button">
                  {isSubmitting ? 'Creating...' : 'Create Sprint'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}