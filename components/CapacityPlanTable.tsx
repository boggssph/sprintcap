"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface Ticket {
  id: string
  jiraId: string
  hours: number
  workType: string
  parentType: string
  plannedUnplanned: string
  memberId: string | null
  sprintId: string
  createdAt: Date
  updatedAt: Date
  member?: {
    id: string
    displayName: string
    name: string
    email: string
  }
}

type SortField = 'jiraId' | 'hours' | 'createdAt' | 'member'
type SortDirection = 'asc' | 'desc'

interface CapacityPlanTableProps {
  tickets: Ticket[]
  onCreateTicket?: () => void
  onEditTicket?: (ticketId: string) => void
  onDeleteTicket?: (ticketId: string) => void
  isLoading?: boolean
}

export default function CapacityPlanTable({
  tickets,
  onCreateTicket,
  onEditTicket,
  onDeleteTicket,
  isLoading = false
}: CapacityPlanTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Get unique assignees for filter
  const assignees = Array.from(new Set(tickets.map(ticket => ticket.member?.displayName).filter(Boolean)))

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const memberDisplayName = ticket.member?.displayName || ticket.member?.name || ticket.member?.email || 'Unassigned'
    const matchesSearch = ticket.jiraId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memberDisplayName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ticket.workType.toLowerCase() === statusFilter.toLowerCase()
    const matchesAssignee = assigneeFilter === "all" || ticket.member?.displayName === assigneeFilter

    return matchesSearch && matchesStatus && matchesAssignee
  })

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let aValue: string | number, bValue: string | number

    switch (sortField) {
      case 'jiraId':
        aValue = a.jiraId.toLowerCase()
        bValue = b.jiraId.toLowerCase()
        break
      case 'hours':
        aValue = a.hours
        bValue = b.hours
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'member':
        aValue = (a.member?.displayName || a.member?.name || a.member?.email || 'Unassigned').toLowerCase()
        bValue = (b.member?.displayName || b.member?.name || b.member?.email || 'Unassigned').toLowerCase()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getWorkTypeColor = (workType: string) => {
    switch (workType.toLowerCase()) {
      case 'backend': return 'bg-blue-100 text-blue-800'
      case 'frontend': return 'bg-green-100 text-green-800'
      case 'testing': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getParentTypeColor = (parentType: string) => {
    switch (parentType.toLowerCase()) {
      case 'feature': return 'bg-indigo-100 text-indigo-800'
      case 'bug': return 'bg-red-100 text-red-800'
      case 'task': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Capacity Tickets</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded h-12"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Capacity Tickets</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Work Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="backend">Backend</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="testing">Testing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee!}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      {sortedTickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500">
            {tickets.length === 0
              ? "Get started by creating your first capacity ticket."
              : "Try adjusting your search or filters."
            }
          </p>
          {tickets.length === 0 && onCreateTicket && (
            <Button onClick={onCreateTicket} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Ticket
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('jiraId')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Jira ID
                    {getSortIcon('jiraId')}
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('hours')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Hours
                    {getSortIcon('hours')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px] hidden sm:table-cell">Work Type</TableHead>
                <TableHead className="w-[100px] hidden md:table-cell">Parent Type</TableHead>
                <TableHead className="w-[120px] hidden lg:table-cell">Planning</TableHead>
                <TableHead className="hidden xl:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('member')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Assigned To
                    {getSortIcon('member')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px] hidden md:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('createdAt')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Created
                    {getSortIcon('createdAt')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.jiraId}</TableCell>
                  <TableCell>{ticket.hours}h</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={getWorkTypeColor(ticket.workType)}>
                      {ticket.workType}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={getParentTypeColor(ticket.parentType)}>
                      {ticket.parentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={ticket.plannedUnplanned === 'PLANNED' ? 'default' : 'secondary'}>
                      {ticket.plannedUnplanned}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {ticket.member ? (
                      <span className="font-medium">
                        {ticket.member.displayName || ticket.member.name || ticket.member.email}
                      </span>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onEditTicket && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTicket(ticket.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      {onDeleteTicket && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTicket(ticket.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}