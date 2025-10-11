"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { WorkType, ParentType, PlannedUnplanned } from '@/lib/types/ticket'

interface TicketCreationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprintId: string
  squadMembers: Array<{ id: string; displayName: string | null }>
  onTicketCreated?: () => void
}

const ticketSchema = z.object({
  jiraId: z.string().min(1, 'Jira ID is required'),
  hours: z.number().min(0, 'Hours must be 0 or greater'),
  workType: z.nativeEnum(WorkType),
  parentType: z.nativeEnum(ParentType),
  plannedUnplanned: z.nativeEnum(PlannedUnplanned),
  memberId: z.string().optional(),
})

type TicketFormData = z.infer<typeof ticketSchema>

export default function TicketCreationDrawer({
  open,
  onOpenChange,
  sprintId,
  squadMembers,
  onTicketCreated
}: TicketCreationDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      jiraId: '',
      hours: 0,
      workType: WorkType.BACKEND,
      parentType: ParentType.STORY,
      plannedUnplanned: PlannedUnplanned.PLANNED,
      memberId: undefined,
    }
  })

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sprints/${sprintId}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jiraId: data.jiraId,
          hours: data.hours,
          workType: data.workType,
          parentType: data.parentType,
          plannedUnplanned: data.plannedUnplanned,
          memberId: data.memberId || undefined
        })
      })

      if (response.ok) {
        toast.success('Ticket created successfully')
        form.reset()
        onOpenChange(false)
        onTicketCreated?.()
      } else {
        const errorData = await response.json()
        // Handle validation errors
        if (errorData.errors) {
          errorData.errors.forEach((error: { field: string; message: string }) => {
            form.setError(error.field as keyof TicketFormData, {
              message: error.message
            })
          })
        } else {
          toast.error(errorData.message || 'Failed to create ticket')
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create ticket')
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
                name="jiraId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jira ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="PROJ-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={WorkType.BACKEND}>Backend</SelectItem>
                        <SelectItem value={WorkType.FRONTEND}>Frontend</SelectItem>
                        <SelectItem value={WorkType.TESTING}>Testing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ParentType.BUG}>Bug</SelectItem>
                        <SelectItem value={ParentType.STORY}>Story</SelectItem>
                        <SelectItem value={ParentType.TASK}>Task</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedUnplanned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planning Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select planning status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PlannedUnplanned.PLANNED}>
                          Planned
                        </SelectItem>
                        <SelectItem value={PlannedUnplanned.UNPLANNED}>
                          Unplanned
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Member (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {squadMembers
                          .filter(member => member.displayName)
                          .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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