'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Edit, Loader2 } from 'lucide-react'
import { SprintUpdateRequestSchema, type SprintUpdateRequest } from '@/lib/validations/sprintUpdate'

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
}

interface SprintUpdateDrawerProps {
  sprint: Sprint
  children?: React.ReactNode
  onSuccess?: () => void
}

export function SprintUpdateDrawer({ sprint, children, onSuccess }: SprintUpdateDrawerProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SprintUpdateRequest>({
    resolver: zodResolver(SprintUpdateRequestSchema),
    defaultValues: {
      name: sprint.name,
      startDate: new Date(sprint.startDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: new Date(sprint.endDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: sprint.status,
    },
  })

  // Reset form when sprint changes or drawer opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: sprint.name,
        startDate: new Date(sprint.startDate).toISOString().split('T')[0],
        endDate: new Date(sprint.endDate).toISOString().split('T')[0],
        status: sprint.status,
      })
    }
  }, [sprint, open, form])

  const onSubmit = async (data: SprintUpdateRequest) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sprints/${sprint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update sprint')
      }

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update sprint:', error)
      // TODO: Add toast notification for errors
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Update Sprint
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Update Sprint</DrawerTitle>
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter sprint name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INACTIVE">Planned</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Sprint
              </Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}