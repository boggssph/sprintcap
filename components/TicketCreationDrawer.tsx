"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerDescription
} from '@/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { WorkType, ParentType, PlannedUnplanned } from '@/lib/types/ticket'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

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
      setShowConfirmDialog(true)
      return
    }
    onOpenChange(newOpen)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[95vh] w-full max-w-2xl mx-auto overflow-visible">
        <DrawerHeader className="px-6 py-4">
          <DrawerTitle className="text-2xl font-semibold">Create New Ticket</DrawerTitle>
          <DrawerDescription>
            Fill in the details below to create a new ticket for capacity planning.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-labelledby="ticket-form-title" aria-describedby="ticket-form-description">
              <div id="ticket-form-title" className="sr-only">
                Create New Ticket Form
              </div>
              <div id="ticket-form-description" className="sr-only">
                Fill in the details below to create a new ticket for capacity planning.
              </div>

              <FormField
                control={form.control}
                name="jiraId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Jira ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="PROJ-123" className="h-12 text-base" {...field} />
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
                    <FormLabel className="text-base font-medium">Hours *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="0.0"
                        className="h-12 text-base"
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
                    <FormLabel className="text-base font-medium">Work Type *</FormLabel>
                    <Combobox
                      options={[
                        { label: 'Backend', value: WorkType.BACKEND },
                        { label: 'Frontend', value: WorkType.FRONTEND },
                        { label: 'Testing', value: WorkType.TESTING }
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select work type"
                      className="h-12 text-base"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Parent Type *</FormLabel>
                    <Combobox
                      options={[
                        { label: 'Bug', value: ParentType.BUG },
                        { label: 'Story', value: ParentType.STORY },
                        { label: 'Task', value: ParentType.TASK }
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select parent type"
                      className="h-12 text-base"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedUnplanned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Planning Category *</FormLabel>
                    <Combobox
                      options={[
                        { label: 'Planned', value: PlannedUnplanned.PLANNED },
                        { label: 'Unplanned', value: PlannedUnplanned.UNPLANNED }
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select planning status"
                      className="h-12 text-base"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Assigned Member (Optional)</FormLabel>
                    <Combobox
                      options={squadMembers
                        .filter(member => member.displayName)
                        .map((member) => ({
                          label: member.displayName!,
                          value: member.id
                        }))}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder="Select member (optional)"
                      className="h-12 text-base"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-3 pt-6">
                <DrawerClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting} className="h-12 text-base">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit" disabled={isSubmitting} className="h-12 text-base min-w-[140px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Ticket'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false)
                onOpenChange(false)
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  )
}