"use client"

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

type Props = {
  name: string
  alias: string
  onChangeName: (v: string) => void
  onChangeAlias: (v: string) => void
}

export default function SquadFormFields({ name, alias, onChangeName, onChangeAlias }: Props) {
  return (
    <>
      <div className="space-y-1">
        <Label className="text-sm font-medium text-slate-700">Name</Label>
        <Input placeholder="e.g. Frontend Squad" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeName(e.target.value)} />
        <p className="text-xs text-slate-500">A descriptive name for the squad.</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm font-medium text-slate-700">Alias</Label>
        <Input placeholder="e.g. frontend" value={alias} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeAlias(e.target.value)} />
        <p className="text-xs text-slate-500">Short unique handle used in URLs and mentions.</p>
      </div>
    </>
  )
}
