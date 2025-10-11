"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
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
      name: squad?.name || '',
      alias: squad?.alias?.toUpperCase() || '',
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
      // Initialize with basic squad data immediately
      form.reset({
        name: squad.name,
        alias: squad.alias.toUpperCase(),
        dailyScrumMinutes: form.getValues('dailyScrumMinutes'),
        refinementHours: form.getValues('refinementHours'),
        reviewDemoMinutes: form.getValues('reviewDemoMinutes'),
        planningHours: form.getValues('planningHours'),
        retrospectiveMinutes: form.getValues('retrospectiveMinutes')
      })
      
      // Then fetch ceremony defaults
      fetchSquadDetails()
    }
  }, [squad])

  const fetchSquadDetails = async () => {
    try {
      const response = await fetch(`/api/squads/${squad.id}`)
      if (response.ok) {
        const data = await response.json()
        const squadData = data.squad
        // Only update ceremony defaults, keep existing name/alias
        form.setValue('dailyScrumMinutes', squadData.ceremonyDefaults?.dailyScrumMinutes || 15)
        form.setValue('refinementHours', squadData.ceremonyDefaults?.refinementHours || 1)
        form.setValue('reviewDemoMinutes', squadData.ceremonyDefaults?.reviewDemoMinutes || 30)
        form.setValue('planningHours', squadData.ceremonyDefaults?.planningHours || 2)
        form.setValue('retrospectiveMinutes', squadData.ceremonyDefaults?.retrospectiveMinutes || 30)
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
      <DrawerContent className="max-h-[95vh] w-full max-w-2xl mx-auto overflow-visible">
        <DrawerHeader>
          <DrawerTitle>Edit Squad</DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-3 pt-6">
                <DrawerClose asChild>
                  <Button variant="outline" data-testid="cancel-squad-edit" className="h-12 text-base">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="save-squad-button"
                  className="h-12 text-base min-w-[140px]"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}