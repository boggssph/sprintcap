"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

interface SquadCreationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSquadCreated?: () => void
}

interface SquadFormData {
  name: string
  alias: string
}

export default function SquadCreationDrawer({
  open,
  onOpenChange,
  onSquadCreated
}: SquadCreationDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SquadFormData>({
    defaultValues: {
      name: '',
      alias: ''
    }
  })

  const onSubmit = async (data: SquadFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/squads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Squad created successfully')
        form.reset()
        onOpenChange(false)
        onSquadCreated?.()
      } else if (response.status === 400) {
        const errorData = await response.json()
        // Handle validation errors
        if (errorData.details) {
          Object.entries(errorData.details).forEach(([field, message]) => {
            form.setError(field as keyof SquadFormData, {
              message: message as string
            })
          })
        } else {
          toast.error(errorData.message || 'Validation failed')
        }
      } else if (response.status === 409) {
        const errorData = await response.json()
        form.setError('alias', {
          message: errorData.details?.alias || 'This alias is already taken'
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to create squad')
      }
    } catch (error) {
      console.error('Error creating squad:', error)
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
    if (!newOpen) {
      form.reset()
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} data-testid="squad-creation-drawer">
      <DrawerContent className="max-h-[85vh] lg:max-w-7xl lg:mx-auto" data-testid="drawer-content">
        <DrawerHeader>
          <DrawerTitle>Create New Squad</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Squad Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Alpha Team"
                        {...field}
                        disabled={isSubmitting}
                        data-testid="squad-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Squad Alias</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., alpha-team"
                        {...field}
                        disabled={isSubmitting}
                        data-testid="squad-alias-input"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens allowed.
                    </p>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    data-testid="cancel-squad-creation"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                  data-testid="create-squad-submit"
                >
                  {isSubmitting ? 'Creating...' : 'Create Squad'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}