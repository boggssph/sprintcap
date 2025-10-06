"use client";
import React, { useState, useEffect } from "react";
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Users, Settings, Plus } from "lucide-react";
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
function EditSquadForm({ squad, onSuccess, refreshSquads }: { squad: Squad; onSuccess: (updated?: Squad) => void; refreshSquads?: () => Promise<void> }) {
  const [name, setName] = React.useState(squad?.name || '');
  const [alias, setAlias] = React.useState(squad?.alias || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !alias.trim()) {
      setError('Name and alias are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/squads/${squad.id}`, {
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
function InviteMembersForm({ squad, onSuccess, refreshSquads }: { squad: Squad; onSuccess: (updated?: Squad) => void; refreshSquads?: () => Promise<void> }) {
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
    setLoading(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: list, squadId: squad.id })
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
      <div className="text-sm text-slate-600">Inviting to: {squad?.alias || squad?.name || 'Unnamed'}</div>
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
  // showSprintForm removed - sprint form is rendered in the 'sprint' view

  const [squadAction, setSquadAction] = useState<null | 'create' | 'edit' | 'invite'>(null);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
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
      if (!selectedSquad && (data.squads || []).length > 0) {
        setSelectedSquad((data.squads || [])[0]);
      }
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

  function handleSignOut() {
    // Use NextAuth signOut helper which will clear the session and redirect.
    // Redirect to no-access page after sign out.
    signOut({ callbackUrl: '/auth/no-access' });
  }

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
                    ref={squadMenuButtonRef}
                    className={view === 'squad' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => {
                      setView('squad');
                      setSquadMenuOpen((open) => !open);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSquadMenuOpen((open) => !open)
                      }
                    }}
                    aria-expanded={squadMenuOpen}
                    aria-controls="squad-submenu"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Squad
                  </SidebarMenuButton>

                  {squadMenuOpen && (
                    <div id="squad-submenu" className="ml-8 mt-1 space-y-1" onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setSquadMenuOpen(false);
                        squadMenuButtonRef.current?.focus()
                      }
                    }}>
                      <Button ref={squadFirstSubRef} variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setView('squad'); setSquadAction('create'); }}>
                        + Create Squad
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setView('squad'); setSquadAction('edit'); }}>
                        ! Edit Squad
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setView('squad'); setSquadAction('invite'); }}>
                        Invite Members
                      </Button>
                    </div>
                  )}
                </SidebarMenuItem>
                {/* Sprint with submenu */}
                  <SidebarMenuItem>
                  <SidebarMenuButton
                    ref={sprintMenuButtonRef}
                    className={view === 'sprint' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => {
                      setView('sprint');
                      setSprintMenuOpen((open) => !open);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSprintMenuOpen(open => !open) } }}
                    aria-expanded={sprintMenuOpen}
                    aria-controls="sprint-submenu"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Sprint
                  </SidebarMenuButton>
                  {sprintMenuOpen && (
                    <div id="sprint-submenu" className="ml-8 mt-1 space-y-1" onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setSprintMenuOpen(false);
                        sprintMenuButtonRef.current?.focus()
                      }
                    }}>
                      <Button ref={sprintFirstSubRef} variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setView('sprint'); setSprintMenuOpen(false); }}>
                        + Create Sprint
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
            <ScrumMasterHeader onSignOut={handleSignOut} />
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
                        <Button onClick={() => { setView('sprint'); setSprintMenuOpen(false); }} className="bg-indigo-600 text-white hover:bg-indigo-700">+ Create Sprint</Button>
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
                  {squadAction === 'edit' && selectedSquad && (
                    <EditSquadForm
                      squad={selectedSquad}
                      refreshSquads={fetchSquads}
                      onSuccess={(updated) => {
                        setSquadAction(null);
                        if (updated) setSelectedSquad(updated as Squad);
                      }}
                    />
                  )}
                  {squadAction === 'invite' && selectedSquad && (
                    <InviteMembersForm
                      squad={selectedSquad}
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
                  <div className="mb-6">
                    <SprintCreationForm squadsProp={squads as unknown as { id: string; name: string; alias?: string; memberCount: number }[]} selectedSquadIdProp={selectedSquad?.id as string | undefined} onSprintCreated={() => { /* no-op for now */ }} />
                  </div>
                  <div>Sprint list and other sprint actions go here.</div>
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

