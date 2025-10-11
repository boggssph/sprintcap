"use client"

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MainShellSection } from './MainShell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { calculateCeremonyTime } from '@/lib/services/ceremonyCalculations'


type SprintFormSquad = {
  id: string;
  name: string;
  alias?: string;
  memberCount: number;
};

type SprintCreationFormProps = {
  onSprintCreated?: () => void;
  squadsProp?: SprintFormSquad[]; // optional squads passed from parent to avoid refetch
  selectedSquadIdProp?: string; // optional preselected squad id
};


export default function SprintCreationForm({ onSprintCreated, squadsProp, selectedSquadIdProp }: SprintCreationFormProps) {
  // Handles input changes for form fields
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  const [squads, setSquads] = useState<SprintFormSquad[]>(squadsProp || []);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; name?: string; email?: string }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [ceremonyBreakdown, setCeremonyBreakdown] = useState<{
    dailyScrumTotal: number;
    refinementTotal: number;
    reviewDemoTotal: number;
    planningTotal: number;
    retrospectiveTotal: number;
    totalCeremonyHours: number;
  } | null>(null);
  const [squadCeremonyDefaults, setSquadCeremonyDefaults] = useState<{
    dailyScrumMinutes: number;
    refinementHours: number;
    reviewDemoMinutes: number;
    planningHours: number;
    retrospectiveMinutes: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    sprintNumber: '',
    squadId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // members list is not shown in the creation UI; omit fetching to simplify UX

  // Fetch members when a squad is selected
  useEffect(() => {
    let mounted = true
    async function fetchMembers(squadId: string) {
      setMembers([])
      setMembersError(null)
      setMembersLoading(true)
      try {
        const res = await fetch(`/api/squads/${squadId}/members`)
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members || [])
        } else {
          setMembers([])
          setMembersError('Failed to load members')
        }
      } catch (err) {
        setMembers([])
        setMembersError('Failed to load members')
      } finally {
        if (mounted) setMembersLoading(false)
      }
    }

    if (formData.squadId) {
      // kick off member fetch for selected squad
      fetchMembers(formData.squadId)
    } else {
      // clear members when no squad selected
      setMembers([])
      setMembersLoading(false)
      setMembersError(null)
    }

    return () => { mounted = false }
  }, [formData.squadId])
  // --- Move validateForm and handleSubmit inside the component ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.sprintNumber.trim()) {
      newErrors.sprintNumber = 'Sprint name is required';
    }
    if (!formData.squadId) {
      newErrors.squadId = 'Please select a squad';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endDate = 'End date and time must be after start date and time';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fullSprintName,
          squadId: formData.squadId,
          startDate: `${formData.startDate}T${formData.startTime}`,
          endDate: `${formData.endDate}T${formData.endTime}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.warning) {
          toast.warning(data.warning);
        }
        toast.success('Sprint created')
        setFormData({
          sprintNumber: '',
          squadId: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: ''
        });
        onSprintCreated?.();
      } else {
        const errorData = await res.json();
        setErrors({ submit: errorData.error || 'Failed to create sprint' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Get selected squad
  const selectedSquad = squads.find(squad => squad.id === formData.squadId)
  
  // Compute full sprint name (format: 'SquadAlias-Sprint-[number]')
  const fullSprintName = selectedSquad?.alias && formData.sprintNumber.trim() 
    ? `${selectedSquad.alias}-Sprint-${formData.sprintNumber.trim()}`
    : ''

  // If parent provided squads, use them; otherwise fetch on mount
  useEffect(() => {
    if (squadsProp && squadsProp.length > 0) {
      setSquads(squadsProp)
      // preselect if provided
      if (selectedSquadIdProp) setFormData(prev => ({ ...prev, squadId: selectedSquadIdProp }))
      return
    }
    // fetch only when parent didn't supply squads
    let mounted = true
    async function fetchSquads() {
      try {
        const res = await fetch('/api/squads')
        if (res.ok) {
          const data = await res.json()
          if (!mounted) return
          setSquads(data.squads || [])
        } else {
          console.error('Failed to fetch squads:', res.status, res.statusText)
          setErrors({ submit: 'Failed to load squads. Please refresh the page.' })
        }
      } catch (error) {
        console.error('Failed to fetch squads:', error)
        setErrors({ submit: 'Network error. Please check your connection.' })
      }
    }
    fetchSquads()
    return () => { mounted = false }
  }, [squadsProp, selectedSquadIdProp])

  // Fetch squad ceremony defaults when squad changes
  useEffect(() => {
    async function fetchSquadDefaults(squadId: string) {
      try {
        const response = await fetch(`/api/squads/${squadId}`)
        if (response.ok) {
          const data = await response.json()
          setSquadCeremonyDefaults(data.squad.ceremonyDefaults)
        }
      } catch (error) {
        console.error('Error fetching squad defaults:', error)
      }
    }

    if (formData.squadId) {
      fetchSquadDefaults(formData.squadId)
    } else {
      setSquadCeremonyDefaults(null)
      setCeremonyBreakdown(null)
    }
  }, [formData.squadId])

  // Calculate ceremony breakdown when dates or squad changes
  useEffect(() => {
    if (squadCeremonyDefaults && formData.startDate && formData.endDate) {
      const startDate = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`)
      const endDate = new Date(`${formData.endDate}T${formData.endTime || '23:59'}`)
      if (startDate < endDate) {
        const breakdown = calculateCeremonyTime(squadCeremonyDefaults, startDate, endDate)
        setCeremonyBreakdown(breakdown)
      } else {
        setCeremonyBreakdown(null)
      }
    } else {
      setCeremonyBreakdown(null)
    }
  }, [squadCeremonyDefaults, formData.startDate, formData.startTime, formData.endDate, formData.endTime])

  // --- Render logic below ---

  // Non-dialog branch
  return (
    <MainShellSection>
      {squads.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">No squads available. Please contact an administrator to create a squad for you.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* removed debug/deploy test label */}
            {/* Squad selection dropdown */}
            <div className="space-y-2">
              <Label htmlFor="squadId">Squad</Label>
              <Combobox
                options={squads.map((squad) => ({
                  label: `${squad.name} ${squad.alias ? `(${squad.alias})` : ''} - ${squad.memberCount} member${squad.memberCount === 1 ? '' : 's'}`,
                  value: squad.id,
                }))}
                value={formData.squadId}
                onValueChange={(value) => handleInputChange('squadId', value)}
                placeholder="Select a squad"
                disabled={squads.length === 0}
                className={`${errors.squadId ? 'border-red-500' : ''} bg-white shadow-sm`}
              />
              {errors.squadId && <p className="text-sm text-red-500">{errors.squadId}</p>}
            </div>
            {/* Members list - tests expect loading / members / empty / error states */}
            <div className="space-y-2">
                {membersLoading ? (
                  <div className="text-sm text-gray-600">Loading members...</div>
                ) : formData.squadId ? (
                  members.length > 0 ? (
                    <div>
                      <div className="text-sm font-medium">Members ({members.length})</div>
                      <ul className="mt-2 space-y-1">
                        {members.map(m => (
                          <li key={m.id} className="text-sm">{m.name || m.email}</li>
                        ))}
                      </ul>
                    </div>
                  ) : membersError ? (
                    <div role="alert" className="text-sm text-red-600">Failed to load members. Please try again.</div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium">Members (0)</div>
                      <div className="text-sm text-gray-600">No members found in this squad.</div>
                    </div>
                  )
                ) : null}
            </div>
            {/* Sprint name input with prefix */}
            <div className="space-y-2">
              <Label htmlFor="sprintNumber">Sprint Name</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                  {selectedSquad?.alias ? `${selectedSquad.alias}-Sprint-` : 'Select squad first'}
                </span>
                <Input
                  id="sprintNumber"
                  type="text"
                  placeholder={selectedSquad?.alias ? "e.g., 1, 2, 2025.10" : ""}
                  value={formData.sprintNumber}
                  onChange={(e) => handleInputChange('sprintNumber', e.target.value)}
                  className={`pl-32 ${errors.sprintNumber ? 'border-red-500' : ''}`}
                  disabled={!selectedSquad?.alias}
                />
              </div>
              {selectedSquad?.alias && formData.sprintNumber.trim() && (
                <div className="text-xs text-gray-600 mt-1">
                  Full Sprint Name: <span className="font-mono text-gray-900">{selectedSquad.alias}-Sprint-{formData.sprintNumber.trim()}</span>
                </div>
              )}
              {errors.sprintNumber && <p className="text-sm text-red-500">{errors.sprintNumber}</p>}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={errors.startTime ? 'border-red-500' : ''}
                  />
                  {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={errors.endTime ? 'border-red-500' : ''}
                  />
                  {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
                </div>
              </div>
            </div>
            {ceremonyBreakdown && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Ceremony Time Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Daily Scrum:</span>
                    <span className="ml-2 font-mono text-blue-900">{ceremonyBreakdown.dailyScrumTotal}min</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Refinement:</span>
                    <span className="ml-2 font-mono text-blue-900">{ceremonyBreakdown.refinementTotal}h</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Review & Demo:</span>
                    <span className="ml-2 font-mono text-blue-900">{ceremonyBreakdown.reviewDemoTotal}min</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Sprint Planning:</span>
                    <span className="ml-2 font-mono text-blue-900">{ceremonyBreakdown.planningTotal}h</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Retrospective:</span>
                    <span className="ml-2 font-mono text-blue-900">{ceremonyBreakdown.retrospectiveTotal}min</span>
                  </div>
                  <div className="md:col-span-3 border-t border-blue-200 pt-2">
                    <span className="text-blue-800 font-medium">Total Ceremony Time:</span>
                    <span className="ml-2 font-mono text-blue-900 font-bold">{ceremonyBreakdown.totalCeremonyHours.toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            )}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Sprint...' : 'Create Sprint'}
            </Button>
          </form>
        )}
    </MainShellSection>
  );
}