"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import SprintCreationForm from '@/components/SprintCreationForm'
import SprintList from '@/components/SprintList'

export default function ScrumMasterDashboardClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/no-access')
    return null
  }

  // Check if user has SCRUM_MASTER role
  if ((session.user as any)?.role !== 'SCRUM_MASTER') {
    router.push('/auth/no-access')
    return null
  }

  const handleSprintCreated = () => {
    // Trigger refresh of sprint list
    setRefreshTrigger(prev => prev + 1)
    // Close the dialog
    setDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scrum Master Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {session.user?.name || session.user?.email}! Manage your squads and sprints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Sprint Management</h2>
              <p className="text-gray-600 mb-4">
                Create and manage sprints for your squads. New sprints are created as inactive by default.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    + Create New Sprint
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Sprint</DialogTitle>
                  </DialogHeader>
                  <SprintCreationForm onSprintCreated={handleSprintCreated} inDialog={true} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div>
            {/* Placeholder for future sprint management features */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">View Squad Details</div>
                  <div className="text-sm text-gray-500">Manage squad members and settings</div>
                </button>
                <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Sprint Analytics</div>
                  <div className="text-sm text-gray-500">View sprint performance metrics</div>
                </button>
                <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Team Reports</div>
                  <div className="text-sm text-gray-500">Generate team productivity reports</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <SprintList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}