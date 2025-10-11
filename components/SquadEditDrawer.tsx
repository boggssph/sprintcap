"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer'
import {
  Form,
} from '@/components/ui/form'
import { toast } from 'sonner'
import SquadFormFields from './SquadFormFields'

interface Squad {
  id: string
  name: string
  alias: string
  memberCount: number
  createdAt: string
  members?: Array<{
    id: string
    name: string
    joinedAt: string
  }>
}

interface SquadEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  squad: Squad
  onSquadUpdated?: () => void
}

interface SquadFormData {
  name: string
  alias: string
  dailyScrumMinutes: number
  refinementHours: number
  reviewDemoMinutes: number
  planningHours: number
  retrospectiveMinutes: number
}

export default function SquadEditDrawer({
  open,
  onOpenChange,
  squad,
  onSquadUpdated
}: SquadEditDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SquadFormData>({
    defaultValues: {
      name: '',
      alias: '',
      dailyScrumMinutes: 15,
      refinementHours: 1,
      reviewDemoMinutes: 30,
      planningHours: 2,
      retrospectiveMinutes: 30
    }
  })

  // Update form when squad changes
  useEffect(() => {
    if (squad) {
      // Fetch current squad details including ceremony defaults
      fetchSquadDetails()
    }
  }, [squad])

  const fetchSquadDetails = async () => {
    try {
      const response = await fetch(`/api/squads/${squad.id}`)
      if (response.ok) {
        const data = await response.json()
        const squadData = data.squad
        form.reset({
          name: squadData.name,
          alias: squadData.alias,
          dailyScrumMinutes: squadData.ceremonyDefaults?.dailyScrumMinutes || 15,
          refinementHours: squadData.ceremonyDefaults?.refinementHours || 1,
          reviewDemoMinutes: squadData.ceremonyDefaults?.reviewDemoMinutes || 30,
          planningHours: squadData.ceremonyDefaults?.planningHours || 2,
          retrospectiveMinutes: squadData.ceremonyDefaults?.retrospectiveMinutes || 30
        })
      }
    } catch (error) {
      console.error('Error fetching squad details:', error)
      toast.error('Failed to load squad details')
    }
  }

  const onSubmit = async (data: SquadFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/squads/${squad.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Squad updated successfully')
        onSquadUpdated?.()
        onOpenChange(false)
      } else {
        const errorData = await response.json()

        // Handle field-specific errors
        if (errorData.details) {
          errorData.details.forEach((error: { field: string; message: string }) => {
            form.setError(error.field as keyof SquadFormData, {
              type: 'manual',
              message: error.message,
            })
          })
        } else {
          toast.error(errorData.message || 'Failed to update squad')
        }
      }
    } catch (error) {
      console.error('Error updating squad:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} data-testid="squad-edit-drawer">
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Edit Squad</DrawerTitle>
        </DrawerHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <SquadFormFields
              name={form.watch('name')}
              alias={form.watch('alias')}
              dailyScrumMinutes={form.watch('dailyScrumMinutes')}
              refinementHours={form.watch('refinementHours')}
              reviewDemoMinutes={form.watch('reviewDemoMinutes')}
              planningHours={form.watch('planningHours')}
              retrospectiveMinutes={form.watch('retrospectiveMinutes')}
              onChangeName={(value) => form.setValue('name', value)}
              onChangeAlias={(value) => form.setValue('alias', value)}
              onChangeDailyScrumMinutes={(value) => form.setValue('dailyScrumMinutes', value)}
              onChangeRefinementHours={(value) => form.setValue('refinementHours', value)}
              onChangeReviewDemoMinutes={(value) => form.setValue('reviewDemoMinutes', value)}
              onChangePlanningHours={(value) => form.setValue('planningHours', value)}
              onChangeRetrospectiveMinutes={(value) => form.setValue('retrospectiveMinutes', value)}
            />

            <DrawerFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="save-squad-button"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" data-testid="cancel-squad-edit">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}