"use client"

import { useState } from "react"
import CapacityPlanCard from "./CapacityPlanCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

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

interface CapacityPlanGridProps {
  tickets: Ticket[]
  onCreateTicket?: () => void
  onEditTicket?: (ticketId: string) => void
  onDeleteTicket?: (ticketId: string) => void
  isLoading?: boolean
}

export default function CapacityPlanGrid({
  tickets,
  onCreateTicket,
  onEditTicket,
  onDeleteTicket,
  isLoading = false
}: CapacityPlanGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")

  // Get unique assignees for filter
  const assignees = Array.from(new Set(tickets.map(ticket => ticket.member?.displayName).filter(Boolean)))

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.jiraId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.member?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ticket.workType.toLowerCase() === statusFilter.toLowerCase()
    const matchesAssignee = assigneeFilter === "all" || ticket.member?.displayName === assigneeFilter

    return matchesSearch && matchesStatus && matchesAssignee
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Capacity Tickets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
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

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map(ticket => (
            <CapacityPlanCard
              key={ticket.id}
              ticket={ticket}
              onEdit={onEditTicket}
              onDelete={onDeleteTicket}
            />
          ))}
        </div>
      )}
    </div>
  )
}