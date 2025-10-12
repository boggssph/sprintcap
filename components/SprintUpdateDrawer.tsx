'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Edit, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { SprintUpdateRequestSchema, type SprintUpdateRequest, canEditSprint } from '@/lib/validations/sprintUpdate'

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  // Ceremony times in minutes
  dailyScrum?: number
  sprintPlanning?: number
  sprintReview?: number
  sprintRetrospective?: number
}

interface SprintUpdateDrawerProps {
  sprint: Sprint
  children?: React.ReactNode
  onSuccess?: () => void
}

export function SprintUpdateDrawer({ sprint, children, onSuccess }: SprintUpdateDrawerProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const form = useForm<SprintUpdateRequest>({
    resolver: zodResolver(SprintUpdateRequestSchema),
    defaultValues: {
      name: sprint.name,
      startDate: new Date(sprint.startDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: new Date(sprint.endDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: sprint.status,
      dailyScrum: sprint.dailyScrum || 15,
      sprintPlanning: sprint.sprintPlanning || 120,
      sprintReview: sprint.sprintReview || 60,
      sprintRetrospective: sprint.sprintRetrospective || 60,
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
        dailyScrum: sprint.dailyScrum || 15,
        sprintPlanning: sprint.sprintPlanning || 120,
        sprintReview: sprint.sprintReview || 60,
        sprintRetrospective: sprint.sprintRetrospective || 60,
      })
    }
  }, [sprint, open, form])

  const onSubmit = async (data: SprintUpdateRequest) => {
    // Check if sprint can be edited
    if (!canEditSprint(sprint.status)) {
      toast.error('Completed sprints cannot be modified')
      return
    }

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
        if (response.status === 400 && errorData.details) {
          // Handle field-specific errors
          Object.entries(errorData.details).forEach(([field, message]) => {
            form.setError(field as keyof SprintUpdateRequest, {
              message: message as string
            })
          })
          toast.error('Please fix the validation errors below')
        } else {
          toast.error(errorData.message || 'Failed to update sprint')
        }
        return
      }

      toast.success('Sprint updated successfully')
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update sprint:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty && !isSubmitting) {
      setShowConfirmDialog(true)
      return
    }
    setOpen(newOpen)
  }

  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    form.reset()
    setOpen(false)
  }

  const handleCancelClose = () => {
    setShowConfirmDialog(false)
  }

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Update Sprint
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[95vh] w-full max-w-2xl mx-auto overflow-visible">
          <DrawerHeader className="px-6 py-4">
            <DrawerTitle className="text-2xl font-semibold">Update Sprint</DrawerTitle>
            <DrawerDescription>
              Modify sprint details including dates, status, and ceremony time allocations.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                aria-labelledby="sprint-update-form-title"
                aria-describedby="sprint-update-form-description"
              >
                <div id="sprint-update-form-title" className="sr-only">
                  Update Sprint Form
                </div>
                <div id="sprint-update-form-description" className="sr-only">
                  Modify sprint details including dates, status, and ceremony time allocations.
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Sprint Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sprint name" className="h-12 text-base" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-12 text-base" {...field} disabled={isSubmitting} />
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
                        <FormLabel className="text-base font-medium">End Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-12 text-base" {...field} disabled={isSubmitting} />
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
                      <FormLabel className="text-base font-medium">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Ceremony Time Allocations (minutes)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="dailyScrum"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Daily Scrum *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="480"
                              placeholder="15"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sprintPlanning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Sprint Planning *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="480"
                              placeholder="120"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sprintReview"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Sprint Review *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="480"
                              placeholder="60"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sprintRetrospective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Sprint Retrospective *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="480"
                              placeholder="60"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-3 pt-6">
                  <DrawerClose asChild>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting} className="h-12 text-base">
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button type="submit" disabled={isSubmitting} className="h-12 text-base min-w-[140px]">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Sprint'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close this form?
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}