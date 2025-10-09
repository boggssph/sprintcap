"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, Target, User } from 'lucide-react'
import ProfileSettings from '@/components/ProfileSettings'
import CenteredContainer from '@/components/CenteredContainer'
import MainShell from '@/components/MainShell'
import MemberHeader from '@/components/MemberHeader'
import type { Session } from 'next-auth'

export default function MemberDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const loadSession = async () => {
      const { getSession } = await import('next-auth/react')
      const sessionData = await getSession()
      setSession(sessionData)
      setStatus('loaded')
    }
    loadSession()
  }, [])

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

  if (status === 'loading') {
    return (
      <MainShell>
        <CenteredContainer>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </CenteredContainer>
      </MainShell>
    )
  }

  if (!session) return null

  return (
    <MainShell>
      <CenteredContainer>
        <MemberHeader />
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    My Tasks
                  </CardTitle>
                  <CardDescription>View your assigned tasks and capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Tasks</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Time Tracking
                  </CardTitle>
                  <CardDescription>Log time and update progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Log Time</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Sprint Status
                  </CardTitle>
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
      </CenteredContainer>
    </MainShell>
  )
}