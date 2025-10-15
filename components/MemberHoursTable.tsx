"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface MemberHours {
  id: string
  memberId: string
  sprintId: string
  memberName: string
  supportIncidents: number
  prReview: number
  others: number
  createdAt: Date
  updatedAt: Date
}

interface MemberHoursTableProps {
  sprintId: string
}

export default function MemberHoursTable({ sprintId }: MemberHoursTableProps) {
  const [memberHours, setMemberHours] = useState<MemberHours[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch member hours
  const fetchMemberHours = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/member-hours?sprintId=${sprintId}`)
      if (!response.ok) throw new Error('Failed to fetch member hours')
      const data = await response.json()
      // Sort by member name alphabetically
      const sortedData = data.sort((a: MemberHours, b: MemberHours) => 
        a.memberName.localeCompare(b.memberName)
      )
      setMemberHours(sortedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemberHours()
  }, [sprintId])

  // Save member hours
  const saveMemberHours = async (memberId: string, field: keyof MemberHours, value: number) => {
    if (value < 0) {
      setError('Hours cannot be negative')
      return
    }

    try {
      setSaving(memberId)
      setError(null)

      const response = await fetch('/api/member-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          sprintId,
          supportIncidents: field === 'supportIncidents' ? value : memberHours.find(m => m.memberId === memberId)?.supportIncidents || 0,
          prReview: field === 'prReview' ? value : memberHours.find(m => m.memberId === memberId)?.prReview || 0,
          others: field === 'others' ? value : memberHours.find(m => m.memberId === memberId)?.others || 0
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save')
      }

      const updated = await response.json()
      setMemberHours(prev => prev.map(m =>
        m.memberId === memberId
          ? { ...m, [field]: value, updatedAt: new Date(updated.updatedAt) }
          : m
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      // Revert the change
      await fetchMemberHours()
    } finally {
      setSaving(null)
    }
  }

  const handleInputChange = (memberId: string, field: keyof MemberHours, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    if (isNaN(numValue)) return

    // Update local state immediately for UX
    setMemberHours(prev => prev.map(m =>
      m.memberId === memberId ? { ...m, [field]: numValue } : m
    ))
  }

  const handleInputBlur = (memberId: string, field: keyof MemberHours, value: number) => {
    saveMemberHours(memberId, field, value)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <Table data-testid="member-hours-table">
        <TableHeader>
          <TableRow>
            <TableHead>Member Name</TableHead>
            <TableHead>Support and Incidents</TableHead>
            <TableHead>PR Review</TableHead>
            <TableHead>Others</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberHours.map((member) => (
            <TableRow key={member.memberId}>
              <TableCell className="font-medium">
                {member.memberName}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={member.supportIncidents}
                  onChange={(e) => handleInputChange(member.memberId, 'supportIncidents', e.target.value)}
                  onBlur={(e) => handleInputBlur(member.memberId, 'supportIncidents', parseFloat(e.target.value) || 0)}
                  disabled={saving === member.memberId}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={member.prReview}
                  onChange={(e) => handleInputChange(member.memberId, 'prReview', e.target.value)}
                  onBlur={(e) => handleInputBlur(member.memberId, 'prReview', parseFloat(e.target.value) || 0)}
                  disabled={saving === member.memberId}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={member.others}
                  onChange={(e) => handleInputChange(member.memberId, 'others', e.target.value)}
                  onBlur={(e) => handleInputBlur(member.memberId, 'others', parseFloat(e.target.value) || 0)}
                  disabled={saving === member.memberId}
                  className="w-20"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}