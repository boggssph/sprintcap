"use client"

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

type Props = {
  name: string
  alias: string
  dailyScrumMinutes: number
  refinementHours: number
  reviewDemoMinutes: number
  planningHours: number
  retrospectiveMinutes: number
  onChangeName: (v: string) => void
  onChangeAlias: (v: string) => void
  onChangeDailyScrumMinutes: (v: number) => void
  onChangeRefinementHours: (v: number) => void
  onChangeReviewDemoMinutes: (v: number) => void
  onChangePlanningHours: (v: number) => void
  onChangeRetrospectiveMinutes: (v: number) => void
}

export default function SquadFormFields({
  name,
  alias,
  dailyScrumMinutes,
  refinementHours,
  reviewDemoMinutes,
  planningHours,
  retrospectiveMinutes,
  onChangeName,
  onChangeAlias,
  onChangeDailyScrumMinutes,
  onChangeRefinementHours,
  onChangeReviewDemoMinutes,
  onChangePlanningHours,
  onChangeRetrospectiveMinutes
}: Props) {
  return (
    <>
      <div className="space-y-1">
        <Label className="text-sm font-medium text-slate-700">Name</Label>
        <Input placeholder="e.g. Frontend Squad" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeName(e.target.value)} />
        <p className="text-xs text-slate-500">A descriptive name for the squad.</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm font-medium text-slate-700">Alias</Label>
        <Input 
          placeholder="e.g. FRONTEND" 
          value={alias} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeAlias(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} 
        />
        <p className="text-xs text-slate-500">Short unique handle used in URLs and mentions. Only uppercase letters, numbers, and hyphens allowed.</p>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-sm font-medium text-slate-900 mb-3">Ceremony Time Defaults</h3>
        <p className="text-xs text-slate-500 mb-4">Default time allocations for Scrum ceremonies. These will be used when creating new sprints.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">Daily Scrum</Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="15"
                value={dailyScrumMinutes || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeDailyScrumMinutes(parseInt(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">minutes</span>
            </div>
            <p className="text-xs text-slate-500">Daily standup time per working day.</p>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">Refinement</Label>
            <div className="relative">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="1.0"
                value={refinementHours || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeRefinementHours(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">hours</span>
            </div>
            <p className="text-xs text-slate-500">Backlog refinement time per sprint.</p>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">Review & Demo</Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="30"
                value={reviewDemoMinutes || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeReviewDemoMinutes(parseInt(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">minutes</span>
            </div>
            <p className="text-xs text-slate-500">Sprint review and demo time.</p>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">Sprint Planning</Label>
            <div className="relative">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="2.0"
                value={planningHours || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangePlanningHours(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">hours</span>
            </div>
            <p className="text-xs text-slate-500">Sprint planning meeting time.</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label className="text-sm font-medium text-slate-700">Retrospective</Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="30"
                value={retrospectiveMinutes || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeRetrospectiveMinutes(parseInt(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">minutes</span>
            </div>
            <p className="text-xs text-slate-500">Sprint retrospective time.</p>
          </div>
        </div>
      </div>
    </>
  )
}
