"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


type Member = {
  id: string;
  name: string;
};

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
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  // const [loadingSquads, setLoadingSquads] = useState(true); // unused
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);





  const [formData, setFormData] = useState({
    sprintNumber: '',
    squadId: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch members when squad changes
  useEffect(() => {
    if (!formData.squadId) {
      setMembers([]);
      setMemberError(null);
      return;
    }
    setLoadingMembers(true);
    setMemberError(null);
    if (typeof fetch !== 'function') {
      setLoadingMembers(false);
      setMembers([]);
      setMemberError(null);
      return;
    }
    fetch(`/api/squads/${formData.squadId}/members`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await res.json();
        setMembers(data.members || []);
      })
      .catch(() => {
        setMemberError('Failed to load members.');
        setMembers([]);
      })
      .finally(() => {
        setLoadingMembers(false);
      });
  }, [formData.squadId]);

  // --- Move validateForm and handleSubmit inside the component ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.sprintNumber.trim()) {
      newErrors.sprintNumber = 'Sprint number is required';
    }
    if (!formData.squadId) {
      newErrors.squadId = 'Please select a squad';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
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
          startDate: formData.startDate,
          endDate: formData.endDate
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
          endDate: ''
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

  // --- Render logic below ---

  // Non-dialog branch
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sprint</CardTitle>
        <CardDescription>
          Create a sprint for one of your squads. All active squad members will be automatically added as sprint participants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {squads.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">No squads available. Please contact an administrator to create a squad for you.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div style={{ color: 'red', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>DEPLOY TEST</div>
            {/* Squad selection dropdown */}
            <div className="space-y-2">
              <Label htmlFor="squadId">Squad</Label>
              <Select
                value={formData.squadId}
                onValueChange={(value) => handleInputChange('squadId', value)}
                name="squadId"
                disabled={squads.length === 0}
              >
                <SelectTrigger id="squadId" className={errors.squadId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a squad" />
                </SelectTrigger>
                <SelectContent>
                  {squads.map((squad) => (
                    <SelectItem key={squad.id} value={squad.id}>
                      {squad.name} {squad.alias ? `(${squad.alias})` : ''} - {squad.memberCount} member{squad.memberCount === 1 ? '' : 's'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.squadId && <p className="text-sm text-red-500">{errors.squadId}</p>}
            </div>
            {/* Member list display */}
            {selectedSquad && (
              <div className="mb-2">
                <div className="font-medium text-sm mb-1">
                  Members ({loadingMembers ? '?' : members.length})
                </div>
                {loadingMembers && <div className="text-xs text-gray-500">Loading members...</div>}
                {!loadingMembers && members.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-800">
                    {members.map((m) => (
                      <li key={m.id}>{m.name}</li>
                    ))}
                  </ul>
                )}
                {!loadingMembers && members.length === 0 && (
                  <div className="text-xs text-gray-500">No members found in this squad.</div>
                )}
                {/* Show error as secondary line if present */}
                {!loadingMembers && memberError && (
                  <div className="text-xs text-red-500">{memberError}</div>
                )}
              </div>
            )}
            {/* Sprint number input with prefix */}
            <div className="space-y-2">
              <Label htmlFor="sprintNumber">Sprint Number</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>
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
      </CardContent>
    </Card>
  );
}