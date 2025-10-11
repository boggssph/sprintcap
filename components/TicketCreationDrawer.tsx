"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TicketCreationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprintId: string
  onTicketCreated?: () => void
}

interface TicketFormData {
  title: string
  description: string
  status: string
  assignee: string
  jiraKey: string
}

export default function TicketCreationDrawer({
  open,
  onOpenChange,
  sprintId,
  onTicketCreated
}: TicketCreationDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TicketFormData>({
    defaultValues: {
      title: '',
      description: '',
      status: 'To Do',
      assignee: '',
      jiraKey: ''
    }
  })

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/capacity-plan/${sprintId}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description || undefined,
          status: data.status,
          assignee: data.assignee || undefined,
          jiraKey: data.jiraKey || undefined
        })
      })

      if (response.ok) {
        toast.success('Ticket created successfully')
        form.reset()
        onOpenChange(false)
        onTicketCreated?.()
      } else if (response.status === 400) {
        const errorData = await response.json()
        // Handle validation errors
        if (errorData.details) {
          Object.entries(errorData.details).forEach(([field, message]) => {
            form.setError(field as keyof TicketFormData, {
              message: message as string
            })
          })
        } else {
          toast.error(errorData.message || 'Validation failed')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to create ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      // Show confirmation dialog if form has unsaved changes
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmed) return
    }
    onOpenChange(newOpen)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Create New Ticket</DrawerTitle>
        </DrawerHeader>
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ticket title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter ticket description (optional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignee"
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Assignee must be a valid email address'
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter assignee email (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jiraKey"
                rules={{
                  pattern: {
                    value: /^[A-Z]+-\d+$/,
                    message: 'Jira key must be in format PROJECT-123'
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jira Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Jira key (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <DrawerClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}