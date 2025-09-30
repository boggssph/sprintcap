"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  if (typeof session.user !== 'object' || !('role' in session.user) || (session.user as { role?: string }).role !== 'SCRUM_MASTER') {
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
              <button
                onClick={() => setDialogOpen(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Create New Sprint
              </button>

              {/* Simple Modal - No Radix UI */}
              {dialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Create New Sprint</h3>
                      <button
                        onClick={() => setDialogOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    <SprintCreationForm onSprintCreated={handleSprintCreated} inDialog={true} />
                  </div>
                </div>
              )}
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