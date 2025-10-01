"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProfileSettings from '@/components/ProfileSettings'
import DisplayNameEditor from '@/components/DisplayNameEditor'

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/')
      return
    }
  if ((session.user as { role?: string })?.role !== 'MEMBER' && (session.user as { role?: string })?.role !== 'SCRUM_MASTER' && (session.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/auth/no-access')
      return
    }
  }, [session, status, router])

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/' })
  }

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

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sprint Capacity</h1>
              <p className="text-sm text-gray-600">Team Member Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <DisplayNameEditor />
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>View your assigned tasks and capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Tasks</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Tracking</CardTitle>
                  <CardDescription>Log time and update progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Log Time</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sprint Status</CardTitle>
                  <CardDescription>View current sprint progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">View Sprint</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-8 text-center text-xs text-gray-400">
      </footer>
    </div>
  )
}