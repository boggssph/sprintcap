"use client";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import SprintCreationForm from '@/components/SprintCreationForm';

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
  const [showSprintDrawer, setShowSprintDrawer] = useState(false);
  const { data: session, status } = useSession()
  const [currentSprint] = useState({
    name: 'Sprint 2025.09',
    startDate: '2025-09-23',
    endDate: '2025-10-06',
    totalCapacity: 120,
    usedCapacity: 85,
    completedTasks: 24,
    totalTasks: 32
  })

  const [squadMembers, setSquadMembers] = useState<TeamMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [membersError, setMembersError] = useState('')

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

  useEffect(() => {
    if (!selectedSquadId) {
      setSquadMembers([])
      setLoadingMembers(false)
      setMembersError('')
      return;
    }
    setLoadingMembers(true);
    setMembersError('');
    const fetchSquadMembers = async () => {
      try {
        const res = await fetch(`/api/squads/${selectedSquadId}/members`);
        if (res.ok) {
          const data = await res.json();
          setSquadMembers((data.members || []).map((m: TeamMember) => ({
            id: m.id,
            displayName: m.displayName || m.email,
            email: m.email,
            squadName: squads.find(sq => sq.id === selectedSquadId)?.name || '',
            squadAlias: squads.find(sq => sq.id === selectedSquadId)?.alias || '',
            dateJoined: m.dateJoined ? new Date(m.dateJoined) : new Date(),
            avatar: m.avatar || ''
          })));
        } else {
          setMembersError('Failed to load squad members.')
          setSquadMembers([])
        }
      } catch (error) {
        setMembersError('Network error loading squad members.')
        setSquadMembers([])
      } finally {
        setLoadingMembers(false)
      }
    };
    fetchSquadMembers();
  }, [selectedSquadId, squads]);

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/' })
  }


  const handleCreateSquad = async () => {
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

  // Simple validation for squad name
  const validateSquadName = (name: string) => {
    if (!name.trim()) return 'Squad name is required';
    if (name.length > 200) return 'Squad name must be 200 characters or less';
    return null;
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

  // Find selected squad
  const selectedSquad = squads.find(squad => squad.id === selectedSquadId)
  // Use squadMembers if a squad is selected, else all teamMembers
  const filteredMembers = squadMembers

  return (
  <>
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="bg-white border-r border-slate-200/60">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Target className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-lg text-slate-800">SprintCap</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setShowSprintDrawer(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sprint
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="h-4 w-4 mr-2" />
                  Squad
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={(session.user as { image?: string })?.image} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {(session.user as { displayName?: string, name?: string })?.displayName?.charAt(0) || (session.user as { name?: string })?.name?.charAt(0) || session.user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="border-slate-300 mt-2 md:mt-0">
            Sign Out
          </Button>
        </header>
        {/* Main Dashboard Content */}
        <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 flex-1 flex flex-col">
          <div>Dashboard</div>
        </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  </>
)
}

