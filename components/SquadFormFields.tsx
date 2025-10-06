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
      <div>
        <Label>Name</Label>
  <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeName(e.target.value)} />
      </div>
      <div>
        <Label>Alias</Label>
  <Input value={alias} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeAlias(e.target.value)} />
      </div>
    </>
  )
}
