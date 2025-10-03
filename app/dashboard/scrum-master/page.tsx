"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  BarChart3,
  Settings,
  Plus,
  Activity,
  Mail
} from 'lucide-react'
import ProfileSettings from '@/components/ProfileSettings'
import DisplayNameEditor from '@/components/DisplayNameEditor'

type TeamMember = {
  id: string
  displayName: string
  email: string
  squadName: string
  squadAlias: string
  dateJoined: Date
  avatar?: string
}

type Squad = {
  id: string
  alias: string
  name: string
  memberCount: number
}

export default function ScrumMasterDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentSprint] = useState({
    name: 'Sprint 2025.09',
    startDate: '2025-09-23',
    endDate: '2025-10-06',
    totalCapacity: 120,
    usedCapacity: 85,
    completedTasks: 24,
    totalTasks: 32
  })

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  const [recentActivities] = useState([
    { id: 1, user: 'Alice Johnson', action: 'completed task', task: 'Implement user authentication', time: '2 hours ago' },
    { id: 2, user: 'Bob Smith', action: 'updated capacity', task: 'Sprint capacity: 7/8 hours', time: '4 hours ago' },
    { id: 3, user: 'Carol Davis', action: 'created task', task: 'Design system components', time: '6 hours ago' },
    { id: 4, user: 'David Wilson', action: 'reported bug', task: 'Login form validation issue', time: '8 hours ago' },
  ])

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [timezone, setTimezone] = useState('America/New_York')
  const [sentInvites, setSentInvites] = useState<Array<{email: string, timestamp: Date}>>([])
  
  // Squad management state
  const [squads, setSquads] = useState<Squad[]>([])
  const [createSquadDialogOpen, setCreateSquadDialogOpen] = useState(false)
  const [squadAlias, setSquadAlias] = useState('')
  const [squadName, setSquadName] = useState('')
  const [selectedSquadId, setSelectedSquadId] = useState<string>('')

  // Sprint creation state
  const [createSprintDialogOpen, setCreateSprintDialogOpen] = useState(false)
  const [sprintNumber, setSprintNumber] = useState('')
  const [sprintSquadId, setSprintSquadId] = useState('')
  const [sprintStartDate, setSprintStartDate] = useState('')
  const [sprintEndDate, setSprintEndDate] = useState('')
  const [sprintLoading, setSprintLoading] = useState(false)
  const [sprintError, setSprintError] = useState('')

  useEffect(() => {
    if (status === 'loading') return // Don't do anything while loading
    if (!session) {
      router.push('/')
      return
    }
  if ((session.user as { role?: string })?.role !== 'SCRUM_MASTER' && (session.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/auth/no-access')
      return
    }
  }, [session, status, router])

  // Load recent invites on component mount
  useEffect(() => {
    const loadRecentInvites = async () => {
      if (!session) return
      
      try {
        const res = await fetch('/api/invite?limit=20')
        if (res.ok) {
          const data = await res.json()
          // Convert database invites to the format expected by sentInvites
          const recentInvites = data.invites
            .filter((invite: { createdAt: string }) => {
              // Only show invites from the last 24 hours
              const inviteTime = new Date(invite.createdAt)
              const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
              return inviteTime > oneDayAgo
            })
            .map((invite: { email: string, createdAt: string }) => ({
              email: invite.email,
              timestamp: new Date(invite.createdAt)
            }))
          setSentInvites(recentInvites)
        }
      } catch (error) {
        console.error('Failed to load recent invites:', error)
      }
    }

    loadRecentInvites()
  }, [session])

  // Load squads on component mount
  useEffect(() => {
    const loadSquads = async () => {
      if (!session) return
      
      try {
        const res = await fetch('/api/squads')
        if (res.ok) {
          const data = await res.json()
          setSquads(data.squads || [])
          // Don't auto-select first squad - let user choose
          // if (data.squads && data.squads.length > 0 && !selectedSquadId) {
          //   setSelectedSquadId(data.squads[0].id)
          // }
        }
      } catch (error) {
        console.error('Failed to load squads:', error)
      }
    }

    loadSquads()
  }, [session, selectedSquadId])

  // Load team members on component mount (all members from all owned squads)
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!session) return

      try {
        const res = await fetch('/api/members')
        if (res.ok) {
          const data = await res.json()
          setTeamMembers(data.members || [])
        }
      } catch (error) {
        console.error('Failed to load team members:', error)
      }
    }

    loadTeamMembers()
  }, [session])

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/' })
  }

  const validateSquadAlias = (alias: string) => {
    if (!alias.trim()) return 'Squad alias is required'
    if (alias.length > 10) return 'Squad alias must be 10 characters or less'
    if (!/^[A-Z0-9]+$/.test(alias)) return 'Squad alias can only contain uppercase letters and numbers'
    return null
  }

  const validateSquadName = (name: string) => {
    if (!name.trim()) return 'Squad name is required'
    if (name.length > 200) return 'Squad name must be 200 characters or less'
    return null
  }

  const handleCreateSquad = async () => {
    const aliasError = validateSquadAlias(squadAlias)
    if (aliasError) {
      setInviteError(aliasError) // Reuse invite error for now
      return
    }

    const nameError = validateSquadName(squadName)
    if (nameError) {
      setInviteError(nameError)
      return
    }

    setInviteLoading(true)
    setInviteError('')

    try {
      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          alias: squadAlias.toUpperCase(),
          name: squadName.trim()
        })
      })

      if (res.ok) {
        const newSquad = await res.json()
        setSquads(prev => [...prev, { ...newSquad, memberCount: 0 }])
        setCreateSquadDialogOpen(false)
        setSquadAlias('')
        setSquadName('')
        // Auto-select the new squad
        setSelectedSquadId(newSquad.id)
      } else {
        const data = await res.json()
        setInviteError(data.error || 'Failed to create squad')
      }
    } catch (error) {
      console.error('Failed to create squad:', error)
      setInviteError('Failed to create squad')
    }
    setInviteLoading(false)
  }

  const handleCreateSprint = async () => {
    // Basic validation
    if (!sprintNumber.trim()) {
      setSprintError('Sprint number is required')
      return
    }
    if (!sprintSquadId) {
      setSprintError('Please select a squad')
      return
    }
    if (!sprintStartDate) {
      setSprintError('Start date is required')
      return
    }
    if (!sprintEndDate) {
      setSprintError('End date is required')
      return
    }
    if (new Date(sprintStartDate) >= new Date(sprintEndDate)) {
      setSprintError('End date must be after start date')
      return
    }

    // Find the selected squad to get the alias
    const selectedSquad = squads.find(squad => squad.id === sprintSquadId)
    if (!selectedSquad) {
      setSprintError('Selected squad not found')
      return
    }

    // Construct the full sprint name
    const fullSprintName = `${selectedSquad.alias} Sprint ${sprintNumber.trim()}`

    setSprintLoading(true)
    setSprintError('')

    try {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullSprintName,
          squadId: sprintSquadId,
          startDate: sprintStartDate,
          endDate: sprintEndDate
        })
      })

      if (res.ok) {
        // Reset form and close dialog
        setCreateSprintDialogOpen(false)
        setSprintNumber('')
        setSprintSquadId('')
        setSprintStartDate('')
        setSprintEndDate('')
        // Could add a success toast here
      } else {
        const data = await res.json()
        setSprintError(data.error || 'Failed to create sprint')
      }
    } catch (error) {
      console.error('Failed to create sprint:', error)
      setSprintError('Failed to create sprint')
    }
    setSprintLoading(false)
  }

  const validateEmails = (emails: string) => {
    if (!emails.trim()) {
      return 'Please enter at least one email address'
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(email => email)
    
    if (emailList.length === 0) {
      return 'Please enter at least one email address'
    }

    if (emailList.length > 10) {
      return 'Maximum 10 email addresses allowed'
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    const invalidEmails = emailList.filter(email => !gmailRegex.test(email))

    if (invalidEmails.length > 0) {
      return `Invalid email addresses: ${invalidEmails.join(', ')}. Only Gmail addresses are allowed.`
    }

    return null
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleInviteSubmit = async () => {
    const error = validateEmails(inviteEmails)
    if (error) {
      setInviteError(error)
      return
    }

    if (!selectedSquadId) {
      setInviteError('Please select a squad for the invitation')
      return
    }

    setInviteLoading(true)
    setInviteError('')

    try {
      const emailList = inviteEmails.split(',').map(email => email.trim()).filter(email => email)
      
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emails: emailList,
          role: 'MEMBER',
          squadId: selectedSquadId
        })
      })

      if (res.ok) {
        // Add sent invites to the list
        const newInvites = emailList.map(email => ({
          email,
          timestamp: new Date()
        }))
        setSentInvites(prev => [...prev, ...newInvites])
        setInviteDialogOpen(false)
        setInviteEmails('')
      } else {
        const data = await res.json()
        setInviteError(data.error || 'Failed to send invites')
      }
    } catch (error) {
      console.error('Failed to send invites:', error)
      setInviteError('Failed to send invites')
    }
    setInviteLoading(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const sprintProgress = (currentSprint.usedCapacity / currentSprint.totalCapacity) * 100
  const taskCompletion = (currentSprint.completedTasks / currentSprint.totalTasks) * 100

  // Filter team members by selected squad (or show all if no squad selected)
  const selectedSquad = squads.find(squad => squad.id === selectedSquadId)
  const filteredMembers = selectedSquadId && selectedSquad
    ? teamMembers.filter(member => {
        // Match by squad alias (case-insensitive, trimmed)
        const memberAlias = member.squadAlias?.trim().toLowerCase()
        const squadAlias = selectedSquad.alias?.trim().toLowerCase()
        return memberAlias === squadAlias
      })
    : teamMembers // Show all members if no squad selected

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-2 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Sprint Capacity
                </h1>
                <p className="text-sm text-slate-600">Scrum Master Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(session.user as { image?: string })?.image} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700">
                    {(session.user as { displayName?: string, name?: string })?.displayName?.charAt(0) || (session.user as { name?: string })?.name?.charAt(0) || session.user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <DisplayNameEditor />
                  <p className="text-xs text-slate-500">Scrum Master</p>
                </div>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-slate-300">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Team Capacity</p>
                  <p className="text-2xl font-bold">{currentSprint.usedCapacity}/{currentSprint.totalCapacity}h</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
              <div className="mt-4">
                <Progress value={sprintProgress} className="h-2 bg-blue-400" />
                <p className="text-xs text-blue-100 mt-1">{Math.round(sprintProgress)}% utilized</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tasks Completed</p>
                  <p className="text-2xl font-bold">{currentSprint.completedTasks}/{currentSprint.totalTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
              <div className="mt-4">
                <Progress value={taskCompletion} className="h-2 bg-green-400" />
                <p className="text-xs text-green-100 mt-1">{Math.round(taskCompletion)}% complete</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Sprint</p>
                  <p className="text-2xl font-bold">{currentSprint.name}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-200" />
              </div>
              <p className="text-xs text-purple-100 mt-4">
                {new Date(currentSprint.startDate).toLocaleDateString()} - {new Date(currentSprint.endDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Team Members</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-200" />
              </div>
              <p className="text-xs text-orange-100 mt-4">4 active, 0 on leave</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-slate-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="squad" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Squad
            </TabsTrigger>
            <TabsTrigger value="sprints" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Sprints
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Reports
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Sprint Overview */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    Current Sprint Overview
                  </CardTitle>
                  <CardDescription>
                    {currentSprint.name} • {Math.ceil((new Date(currentSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capacity Used</span>
                      <span className="font-medium">{currentSprint.usedCapacity}h / {currentSprint.totalCapacity}h</span>
                    </div>
                    <Progress value={sprintProgress} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tasks Completed</span>
                      <span className="font-medium">{currentSprint.completedTasks} / {currentSprint.totalTasks}</span>
                    </div>
                    <Progress value={taskCompletion} className="h-3" />
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates from your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                            {activity.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-slate-900">{activity.user}</span>
                            {' '}
                            <span className="text-slate-600">{activity.action}</span>
                            {' '}
                            <span className="font-medium text-slate-900">"{activity.task}"</span>
                          </p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="squad" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Squad Management</h2>
              <div className="flex gap-2">
                <Button onClick={() => setCreateSquadDialogOpen(true)} variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Squad
                </Button>
                <Button onClick={() => setInviteDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>
            </div>

            {/* Existing Squads */}
            {squads.length > 0 && (
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Your Squads
                  </CardTitle>
                  <CardDescription>Manage your development squads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {squads.map((squad) => (
                      <div key={squad.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">{squad.alias}</h3>
                          <Badge variant="secondary">{squad.memberCount} members</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{squad.name}</p>
                        <Button 
                          size="sm" 
                          variant={selectedSquadId === squad.id ? "default" : "outline"}
                          onClick={() => setSelectedSquadId(squad.id)}
                          className="w-full"
                        >
                          {selectedSquadId === squad.id ? 'Selected for Invites' : 'Select for Invites'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Squads Message */}
            {squads.length === 0 && (
              <Card className="bg-white border-slate-200">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Squads Yet</h3>
                  <p className="text-slate-600 mb-4">Create your first squad to start inviting team members.</p>
                  <Button onClick={() => setCreateSquadDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Squad
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Timezone Settings */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Timezone Settings</CardTitle>
                <CardDescription>Set your local timezone for displaying timestamps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <label htmlFor="timezone" className="text-sm font-medium">Timezone:</label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Australia/Sydney">Sydney (AEDT)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Members {selectedSquadId ? `(${filteredMembers.length})` : `(${teamMembers.length})`}
                </CardTitle>
                <CardDescription>
                  {selectedSquadId ? `Members of ${selectedSquad?.name || 'selected squad'}` : 'All members from your squads'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      {selectedSquadId ? 'No members in this squad yet. Send invites to get started.' : 'Loading members...'}
                    </p>
                  ) : (
                    filteredMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700">
                              {member.displayName.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{member.displayName}</p>
                            <p className="text-sm text-slate-600">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">{member.squadName}</p>
                            <p className="text-xs text-slate-500">
                              Joined {new Date(member.dateJoined).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sent Invites */}
            {sentInvites.length > 0 && (
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-indigo-600" />
                    Sent Invites
                  </CardTitle>
                  <CardDescription>Recently sent invitations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sentInvites.map((invite, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-slate-900">{invite.email}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Invite sent on: {formatTimestamp(invite.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sprints" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Sprint Management</CardTitle>
                  <CardDescription>Create and manage sprints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={() => setCreateSprintDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Sprint
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Sprint Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Capacity Planning</CardTitle>
                  <CardDescription>Plan team capacity for upcoming sprints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Capacity Trends
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Planning Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Burndown Chart</CardTitle>
                  <CardDescription>Track sprint progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Burndown
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Velocity Report</CardTitle>
                  <CardDescription>Team performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Team Analytics</CardTitle>
                  <CardDescription>Detailed team insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </main>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Squad Members</DialogTitle>
            <DialogDescription>
              Enter Gmail email addresses separated by commas (max 10 addresses).
              Only Gmail addresses are allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="emails" className="text-right text-sm font-medium pt-2">
                Emails
              </label>
              <textarea
                id="emails"
                value={inviteEmails}
                onChange={(e) => {
                  setInviteEmails(e.target.value)
                  setInviteError('')
                }}
                placeholder="user1@gmail.com, user2@gmail.com, user3@gmail.com"
                className="col-span-3 min-h-[100px] p-2 border border-gray-300 rounded-md resize-none"
                disabled={inviteLoading}
              />
            </div>
            {inviteError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded col-span-4">
                {inviteError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={inviteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInviteSubmit}
              disabled={inviteLoading || !!validateEmails(inviteEmails)}
            >
              {inviteLoading ? 'Sending...' : 'Send Invites'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Squad Dialog */}
      <Dialog open={createSquadDialogOpen} onOpenChange={setCreateSquadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Squad</DialogTitle>
            <DialogDescription>
              Create a new development squad. The alias should be unique and contain only uppercase letters and numbers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="squadAlias" className="text-right text-sm font-medium">
                Squad Alias
              </label>
              <input
                id="squadAlias"
                value={squadAlias}
                onChange={(e) => {
                  setSquadAlias(e.target.value.toUpperCase())
                  setInviteError('')
                }}
                placeholder="FMWB"
                maxLength={10}
                className="col-span-3 p-2 border border-gray-300 rounded-md uppercase"
                disabled={inviteLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="squadName" className="text-right text-sm font-medium">
                Squad Name
              </label>
              <input
                id="squadName"
                value={squadName}
                onChange={(e) => {
                  setSquadName(e.target.value)
                  setInviteError('')
                }}
                placeholder="Browse & Shop Squad"
                maxLength={200}
                className="col-span-3 p-2 border border-gray-300 rounded-md"
                disabled={inviteLoading}
              />
            </div>
            {inviteError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded col-span-4">
                {inviteError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateSquadDialogOpen(false)}
              disabled={inviteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSquad}
              disabled={inviteLoading || !!validateSquadAlias(squadAlias) || !!validateSquadName(squadName)}
            >
              {inviteLoading ? 'Creating...' : 'Create Squad'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Sprint Dialog */}
      <Dialog open={createSprintDialogOpen} onOpenChange={setCreateSprintDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
            <DialogDescription>
              Create a new sprint for a squad. All active squad members will be automatically added as sprint participants.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sprintSquad" className="text-right text-sm font-medium">
                Squad
              </label>
              <select
                id="sprintSquad"
                value={sprintSquadId}
                onChange={(e) => {
                  setSprintSquadId(e.target.value)
                  setSprintError('')
                }}
                className="col-span-3 p-2 border border-gray-300 rounded-md"
                disabled={sprintLoading}
              >
                <option value="">Select a squad...</option>
                {squads.map((squad) => (
                  <option key={squad.id} value={squad.id}>
                    {squad.alias} - {squad.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sprintNumber" className="text-right text-sm font-medium">
                Sprint Number
              </label>
              <input
                id="sprintNumber"
                value={sprintNumber}
                onChange={(e) => {
                  setSprintNumber(e.target.value)
                  setSprintError('')
                }}
                placeholder="2025.10"
                maxLength={20}
                className="col-span-3 p-2 border border-gray-300 rounded-md"
                disabled={sprintLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sprintStartDate" className="text-right text-sm font-medium">
                Start Date
              </label>
              <input
                id="sprintStartDate"
                type="datetime-local"
                value={sprintStartDate}
                onChange={(e) => {
                  setSprintStartDate(e.target.value)
                  setSprintError('')
                }}
                className="col-span-3 p-2 border border-gray-300 rounded-md"
                disabled={sprintLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sprintEndDate" className="text-right text-sm font-medium">
                End Date
              </label>
              <input
                id="sprintEndDate"
                type="datetime-local"
                value={sprintEndDate}
                onChange={(e) => {
                  setSprintEndDate(e.target.value)
                  setSprintError('')
                }}
                className="col-span-3 p-2 border border-gray-300 rounded-md"
                disabled={sprintLoading}
              />
            </div>
            {sprintError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded col-span-4">
                {sprintError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateSprintDialogOpen(false)}
              disabled={sprintLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSprint}
              disabled={sprintLoading || !sprintNumber.trim() || !sprintSquadId || !sprintStartDate || !sprintEndDate}
            >
              {sprintLoading ? 'Creating...' : 'Create Sprint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="mt-8 text-center text-xs text-gray-400">
      </footer>
    </div>
  )
}