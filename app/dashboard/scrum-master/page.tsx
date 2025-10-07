"use client";
import React, { useState, useEffect } from "react";
import { toast } from 'sonner'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Users, Settings } from "lucide-react";
// Inline running-person icon to avoid import/export naming issues with the icon package
function RunningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="13" cy="4" r="1.5" />
      <path d="M6 20c1-2 3-3 5-3h1" />
      <path d="M11 7l2 2 3-1" />
      <path d="M14 14l3 6" />
      <path d="M7 13l4 1" />
    </svg>
  )
}
import SprintCreationForm from "@/components/SprintCreationForm";
import SquadFormFields from '@/components/SquadFormFields'
import ScrumMasterHeader from "@/components/ScrumMasterHeader";

// --- Types ---
interface Squad {
  id?: string | number;
  alias?: string;
  name?: string;
  memberCount?: number;
}

// --- Inline Create Squad Form ---
function CreateSquadForm({ onSuccess, refreshSquads }: { onSuccess: () => void; refreshSquads?: () => Promise<void> }) {
  const [name, setName] = React.useState("");
  const [alias, setAlias] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !alias.trim()) {
      setError('Name and alias are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), alias: alias.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Failed to create squad');
        toast.error(data?.error || 'Failed to create squad')
        return;
      }
      await refreshSquads?.();
      toast.success('Squad created')
      onSuccess();
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="max-w-md space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Create Squad</h2>
      <SquadFormFields name={name} alias={alias} onChangeName={setName} onChangeAlias={setAlias} />
      {error && (
        <div role="alert" aria-live="assertive" className="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
        <Button type="button" variant="ghost" onClick={onSuccess}>Cancel</Button>
      </div>
    </form>
  );
}

// --- Inline Edit Squad Form ---
function EditSquadForm({ squads, onSuccess, refreshSquads }: { squads: Squad[]; onSuccess: (updated?: Squad) => void; refreshSquads?: () => Promise<void> }) {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);
  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const s = squads.find(s => String(s.id) === String(selectedId));
    if (s) {
      setName(s.name || '');
      setAlias(s.alias || '');
    } else {
      setName('');
      setAlias('');
    }
  }, [selectedId, squads]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !alias.trim()) {
      setError('Name and alias are required');
      return;
    }
    if (!selectedId) {
      setError('Please select a squad to edit');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/squads/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), alias: alias.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Failed to update squad');
        return;
      }
      const updated = await res.json().catch(() => null);
      // Refresh parent squad list and notify parent with updated squad so it can select it
      await refreshSquads?.();
      toast.success('Squad updated')
      onSuccess(updated || undefined);
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Edit Squad</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Select squad to edit</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="block w-full rounded-md border px-2 py-1">
          <option value={''}>-- choose a squad --</option>
          {squads.map(s => (
            <option key={s.id} value={String(s.id)}>{s.name}{s.alias ? ` (${s.alias})` : ''}</option>
          ))}
        </select>
      </div>
      <SquadFormFields name={name} alias={alias} onChangeName={setName} onChangeAlias={setAlias} />
      {error && (
        <div role="alert" aria-live="assertive" className="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
  <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
  <Button type="button" variant="ghost" onClick={() => onSuccess()}>Cancel</Button>
      </div>
    </form>
  );
}

// --- Inline Invite Members Form ---
function InviteMembersForm({ squads, onSuccess, refreshSquads }: { squads: Squad[]; onSuccess: (updated?: Squad) => void; refreshSquads?: () => Promise<void> }) {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);
  const [emails, setEmails] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const list = emails.split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
    if (!list.length) {
      setError('Please provide one or more email addresses');
      return;
    }
    if (list.length > 10) {
      setError('Maximum 10 emails allowed per request');
      return;
    }
    if (!selectedId) {
      setError('Please select a squad to invite members to');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: list, squadId: selectedId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Failed to send invites');
        toast.error(data?.error || 'Failed to send invites')
        return;
      }
      // Refresh squad list/member counts
      await refreshSquads?.();
      toast.success('Invites sent')
      onSuccess();
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleInvite} className="max-w-md space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Invite Members</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Select squad to invite</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="block w-full rounded-md border px-2 py-1">
          <option value={''}>-- choose a squad --</option>
          {squads.map(s => (
            <option key={s.id} value={String(s.id)}>{s.name}{s.alias ? ` (${s.alias})` : ''}</option>
          ))}
        </select>
        <div className="text-sm text-slate-600">Inviting to: {squads.find(x => String(x.id) === String(selectedId))?.alias || squads.find(x => String(x.id) === String(selectedId))?.name || '—'}</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Emails (comma separated)</label>
        <textarea value={emails} onChange={(e) => setEmails(e.target.value)} className="mt-1 block w-full rounded-md border px-2 py-1" rows={4} />
      </div>
      {error && (
        <div role="alert" aria-live="assertive" className="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2">
  <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Invites'}</Button>
  <Button type="button" variant="ghost" onClick={() => onSuccess()}>Cancel</Button>
      </div>
    </form>
  );
}

export default function ScrumMasterDashboard() {
  const [view, setView] = useState<'overview' | 'squad' | 'sprint' | 'settings'>("overview");
  const [squadMenuOpen, setSquadMenuOpen] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(false);
  // Track the last intent when navigating to sprint view so we don't
  // accidentally override an explicit "create only" action with the
  // generic view effect. Values: 'parent' | 'create' | null
  const lastSprintIntentRef = React.useRef<'parent' | 'create' | null>(null)
  // showSprintForm removed - sprint form is rendered in the 'sprint' view

  const [squadAction, setSquadAction] = useState<null | 'create' | 'edit' | 'invite'>(null);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [sprints, setSprints] = useState<Array<{ id: string; name: string; squadId?: string; startDate?: string }>>([]);
  const [showSprintCreateOnly, setShowSprintCreateOnly] = useState(false);
  // Refs used for focusing submenu items when opened
  const squadMenuButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const squadFirstSubRef = React.useRef<HTMLButtonElement | null>(null)
  const sprintMenuButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const sprintFirstSubRef = React.useRef<HTMLButtonElement | null>(null)

  // When squad submenu opens, move focus to first submenu item
  useEffect(() => {
    if (squadMenuOpen) {
      // slight delay to ensure element is mounted
      setTimeout(() => squadFirstSubRef.current?.focus(), 0)
    }
  }, [squadMenuOpen])

  // When sprint submenu opens, focus its first item
  useEffect(() => {
    if (sprintMenuOpen) {
      setTimeout(() => sprintFirstSubRef.current?.focus(), 0)
    }
  }, [sprintMenuOpen])

  // Format date/time to user's requested style: "Oct-06-2025, 5:00PM"
  function formatDateTime(iso?: string | null) {
    if (!iso) return 'TBA'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return 'TBA'
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    let hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${month}-${day}-${year}, ${hours}:${minutes}${ampm}`
  }

  // Fetch sprints (exposed so we can refresh after creation)
  async function fetchSprints() {
    try {
      const res = await fetch('/api/sprints');
      if (!res.ok) return;
      const data = await res.json();
      setSprints(data.sprints || []);
    } catch (e) {
      console.error('Failed to fetch sprints', e);
    }
  }

  // When sprint view is activated, refresh the list
  useEffect(() => {
    if (view !== 'sprint') {
      // leaving sprint view, clear the "create only" mode
      setShowSprintCreateOnly(false);
      return;
    }
    let mounted = true;
    if (mounted) fetchSprints();
    return () => { mounted = false };
  }, [view]);

  // Load squads for the current Scrum Master so the sidebar/list can operate.
  // fetchSquads is exposed so children (CreateSquadForm) can refresh the list after creating.
  async function fetchSquads() {
    try {
      const res = await fetch('/api/squads');
      if (!res.ok) {
        console.error('Failed to fetch squads', res.statusText);
        return;
      }
      const data = await res.json();
      setSquads(data.squads || []);
      // Do not auto-select a squad. The user must explicitly choose a squad when
      // performing actions like Edit or Invite. This avoids surprise operations.
    } catch (e) {
      console.error('Failed to fetch squads', e);
    }
  }

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchSquads();
    return () => {
      mounted = false;
    };
  }, []);

  // Sign out is handled in the client header component via next-auth's signOut.

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {/* Sidebar for desktop */}
          <Sidebar className="hidden md:flex bg-white border-r border-slate-200/60">
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <Target className="h-6 w-6 text-indigo-600" />
                <span className="font-bold text-lg text-slate-800">SprintCap</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {/* Overview */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={view === 'overview' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => setView('overview')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Squad with submenu */}
                <SidebarMenuItem>
                  {/** Manage focus when submenu opens. We keep refs to the parent button and first submenu item. */}
                  <SidebarMenuButton
                    id="squad-menu-button"
                    ref={squadMenuButtonRef}
                    className={view === 'squad' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => {
                      setView('squad');
                      setSquadMenuOpen((open) => !open);
                    }}
                    onKeyDown={(e) => {
                      // space/enter toggle
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSquadMenuOpen((open) => !open)
                      }
                      // arrow down moves into submenu
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSquadMenuOpen(true);
                        setTimeout(() => squadFirstSubRef.current?.focus(), 0)
                      }
                      // arrow up toggles and focuses last submenu (not implemented here)
                    }}
                    aria-expanded={squadMenuOpen}
                    aria-controls="squad-submenu"
                    role="menuitem"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Squad
                  </SidebarMenuButton>

                  {squadMenuOpen && (
                    <div id="squad-submenu" className="ml-8 mt-1 space-y-1" role="menu" aria-labelledby="squad-menu-button" onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setSquadMenuOpen(false);
                        squadMenuButtonRef.current?.focus()
                      }
                      // allow arrow navigation between submenu items
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const items = Array.from((e.currentTarget as HTMLElement).querySelectorAll('button')) as HTMLButtonElement[]
                        const idx = items.indexOf(document.activeElement as HTMLButtonElement)
                        if (e.key === 'ArrowDown') {
                          const next = items[(idx + 1) % items.length]
                          next?.focus()
                        } else {
                          const prev = items[(idx - 1 + items.length) % items.length]
                          prev?.focus()
                        }
                      }
                      // Home/End
                      if (e.key === 'Home') {
                        e.preventDefault();
                        const items = Array.from((e.currentTarget as HTMLElement).querySelectorAll('button')) as HTMLButtonElement[]
                        items[0]?.focus()
                      }
                      if (e.key === 'End') {
                        e.preventDefault();
                        const items = Array.from((e.currentTarget as HTMLElement).querySelectorAll('button')) as HTMLButtonElement[]
                        items[items.length - 1]?.focus()
                      }
                    }}>
                      <Button ref={squadFirstSubRef} role="menuitem" variant="ghost" size="sm" className="w-full justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md" onClick={() => { setView('squad'); setSquadAction('create'); }}>
                        + Create Squad
                      </Button>
                      <Button role="menuitem" variant="ghost" size="sm" className="w-full justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md" onClick={() => { setView('squad'); setSquadAction('edit'); }}>
                        ! Edit Squad
                      </Button>
                      <Button role="menuitem" variant="ghost" size="sm" className="w-full justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md" onClick={() => { setView('squad'); setSquadAction('invite'); }}>
                        Invite Members
                      </Button>
                    </div>
                  )}
                </SidebarMenuItem>
                {/* Sprint with submenu */}
                  <SidebarMenuItem>
                  <SidebarMenuButton
                    id="sprint-menu-button"
                    ref={sprintMenuButtonRef}
                    className={view === 'sprint' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => {
                      // Mark intent as coming from parent and show list view.
                      lastSprintIntentRef.current = 'parent'
                      setView('sprint');
                      setShowSprintCreateOnly(false);
                      setSprintMenuOpen(false);
                      // clear the intent after a short time to avoid stale state
                      setTimeout(() => { lastSprintIntentRef.current = null }, 1000)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSprintMenuOpen(open => !open) } }}
                    aria-expanded={sprintMenuOpen}
                    aria-controls="sprint-submenu"
                  >
                      <RunningIcon className="h-4 w-4 mr-2" />
                    Sprint
                  </SidebarMenuButton>
                  {sprintMenuOpen && (
                    <div id="sprint-submenu" className="ml-8 mt-1 space-y-1" role="menu" aria-labelledby="sprint-menu-button" onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setSprintMenuOpen(false);
                        sprintMenuButtonRef.current?.focus()
                      }
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const items = Array.from((e.currentTarget as HTMLElement).querySelectorAll('button')) as HTMLButtonElement[]
                        const idx = items.indexOf(document.activeElement as HTMLButtonElement)
                        if (e.key === 'ArrowDown') {
                          const next = items[(idx + 1) % items.length]
                          next?.focus()
                        } else {
                          const prev = items[(idx - 1 + items.length) % items.length]
                          prev?.focus()
                        }
                      }
                      if (e.key === 'Home') { e.preventDefault(); const items = Array.from((e.currentTarget as HTMLElement).querySelectorAll('button')) as HTMLButtonElement[]; items[0]?.focus() }
                      if (e.key === 'End') { e.preventDefault(); const items = Array.from((e.currentTarget as HTMLElement).querySelectorAll('button')) as HTMLButtonElement[]; items[items.length - 1]?.focus() }
                    }}>
                      <Button ref={sprintFirstSubRef} role="menuitem" variant="ghost" size="sm" className="w-full justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md" onClick={() => { lastSprintIntentRef.current = 'create'; setView('sprint'); setSprintMenuOpen(false); setShowSprintCreateOnly(true); setTimeout(() => { lastSprintIntentRef.current = null }, 1000) }}>
                        <Users className="h-4 w-4 mr-2" /> Create Sprint
                      </Button>
                      {/* Add more sprint actions here */}
                    </div>
                  )}
                </SidebarMenuItem>
                {/* Settings */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={view === 'settings' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => setView('settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Main content area */}
          <SidebarInset>
            {/* Header */}
            <ScrumMasterHeader />
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
              {/* Modern hero / KPI area */}
              {view === 'overview' && (
                <section className="mb-6">
                  <div className="bg-gradient-to-r from-white to-slate-50 border border-slate-100 rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Welcome, Scrum Master</h2>
                        <p className="mt-1 text-sm text-slate-600">Manage your squads and sprints efficiently. Quick actions and insights below.</p>
                      </div>
                        <div className="flex gap-2">
                        <Button onClick={() => { lastSprintIntentRef.current = 'create'; setView('sprint'); setSprintMenuOpen(false); setShowSprintCreateOnly(true); setTimeout(() => { lastSprintIntentRef.current = null }, 1000) }} className="bg-indigo-600 text-white hover:bg-indigo-700">+ Create Sprint</Button>
                        <Button onClick={() => { setView('squad'); setSquadAction('create'); }} variant="outline">+ Create Squad</Button>
                      </div>
                    </div>

                    {/* KPI cards */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <div className="text-sm text-slate-500">Active Squads</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">{squads.length}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <div className="text-sm text-slate-500">Upcoming Sprints</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">—</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <div className="text-sm text-slate-500">Pending Invites</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">—</div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {view === 'squad' && (
                <div className="text-slate-700">
                  {/* Squad action views */}
                  {squadAction === null && (
                    <div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Your Squads</h3>
                            <div className="text-sm text-slate-600">Manage members and settings</div>
                          </div>
                          <div>
                            <Button onClick={() => setSquadAction('create')} className="bg-indigo-600 text-white hover:bg-indigo-700">+ New Squad</Button>
                          </div>
                        </div>

                        {squads.length === 0 ? (
                          <div className="mt-4 text-sm text-gray-500">No squads found.</div>
                        ) : (
                          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {squads.map((s) => (
                              <li key={(s.id ?? s.name) as React.Key}>
                                <div className={`p-4 rounded-lg border border-slate-100 bg-white shadow-sm ${selectedSquad?.id === s.id ? 'ring-2 ring-indigo-100' : ''}`}>
                                  <button
                                    className="w-full text-left"
                                    onClick={() => setSelectedSquad(s)}
                                  >
                                    <div className="font-medium text-slate-900">{s.name} {s.alias ? `(${s.alias})` : ''}</div>
                                    <div className="text-xs text-slate-500">{s.memberCount ?? 0} members</div>
                                  </button>
                                  <div className="mt-3 flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedSquad(s); setSquadAction('edit'); }}>Edit</Button>
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedSquad(s); setSquadAction('invite'); }}>Invite</Button>
                                    <div>
                                      <Button ref={sprintFirstSubRef} variant="ghost" size="sm" className="w-full justify-start" onClick={() => { lastSprintIntentRef.current = 'create'; setView('sprint'); setSprintMenuOpen(false); setShowSprintCreateOnly(true); setTimeout(() => { lastSprintIntentRef.current = null }, 1000) }}>
                                        <Users className="h-4 w-4 mr-2" /> Create Sprint
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                  {squadAction === 'create' && (
                    <CreateSquadForm onSuccess={() => setSquadAction(null)} refreshSquads={fetchSquads} />
                  )}
                  {squadAction === 'edit' && (
                    <EditSquadForm
                      squads={squads}
                      refreshSquads={fetchSquads}
                      onSuccess={(updated) => {
                        setSquadAction(null);
                        if (updated) setSelectedSquad(updated as Squad);
                      }}
                    />
                  )}
                  {squadAction === 'invite' && (
                    <InviteMembersForm
                      squads={squads}
                      refreshSquads={fetchSquads}
                      onSuccess={() => {
                        setSquadAction(null);
                        // keep current selection
                      }}
                    />
                  )}
                </div>
              )}
              {view === 'sprint' && (
                <div className="text-slate-700 text-lg">
                  {showSprintCreateOnly ? (
                    <div className="mb-6">
                      <SprintCreationForm
                        squadsProp={squads as unknown as { id: string; name: string; alias?: string; memberCount: number }[]}
                        selectedSquadIdProp={selectedSquad?.id as string | undefined}
                        onSprintCreated={async () => { await fetchSprints(); setShowSprintCreateOnly(false); }}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sprints</h3>
                        <div>
                          <Button onClick={() => { lastSprintIntentRef.current = 'create'; setShowSprintCreateOnly(true); setTimeout(() => { lastSprintIntentRef.current = null }, 1000) }} className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transform transition active:scale-95">+ Create Sprint</Button>
                        </div>
                      </div>
                      <div>
                        {sprints.length === 0 ? (
                          <div className="text-sm text-slate-500">No sprints found.</div>
                        ) : (
                          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                            <div className="space-y-6">
                            {/* Group sprints by squad and show latest + up to 3 past sprints */}
                            {(() => {
                              // Convert sprint list to grouped map by squadId
                              const bySquad: Record<string, Array<{ id: string; name: string; squadId?: string; startDate?: string }>> = {}
                              sprints.forEach(sp => {
                                const key = sp.squadId || 'unassigned'
                                bySquad[key] = bySquad[key] || []
                                bySquad[key].push(sp)
                              })

                              // For each squad, sort descending by startDate (newest first) and take latest + up to 3 past
                              const groups = Object.keys(bySquad).map(squadId => {
                                const list = bySquad[squadId].slice().sort((a, b) => {
                                  const da = a.startDate ? new Date(a.startDate).getTime() : 0
                                  const db = b.startDate ? new Date(b.startDate).getTime() : 0
                                  return db - da
                                })
                                return { squadId, list: list.slice(0, 4) }
                              })

                              // Render each group, showing squad header (resolve to name/alias from squads state when possible)
                              return groups.map(group => {
                                const squad = squads.find(s => String(s.id) === String(group.squadId))
                                return (
                                  <div key={group.squadId} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
                                    <div className="mb-4">
                                      <div className="text-sm text-slate-500">Squad</div>
                                      <div className="text-xl font-semibold text-slate-900">{squad?.name || (group.squadId === 'unassigned' ? 'Unassigned' : group.squadId)}</div>
                                    </div>
                                    <ul className="space-y-3">
                                      {group.list.map(sp => (
                                        <li key={sp.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow transition">
                                          <div className="grid grid-cols-1 md:grid-cols-[1fr,200px] gap-4 items-center">
                                            <div>
                                              <div className="font-semibold text-slate-900 text-lg">{sp.name}</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-sm text-slate-500">Start</div>
                                              <div className="font-medium text-slate-900"><time dateTime={sp.startDate || ''}>{formatDateTime(sp.startDate)}</time></div>
                                              <div className="text-sm text-slate-500 mt-2">End</div>
                                              <div className="font-medium text-slate-900"><time dateTime={sp.startDate || ''}>{formatDateTime(sp.startDate)}</time></div>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              })
                            })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              {view === 'settings' && (
                <div className="text-slate-700 text-lg">Settings and profile actions go here.</div>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}

