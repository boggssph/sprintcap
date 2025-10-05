import React, { useState } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Users, Settings, Plus } from "lucide-react";
import SprintCreationForm from "@/components/SprintCreationForm";
import ScrumMasterHeader from "@/components/ScrumMasterHeader";

// --- Types ---
interface Squad {
  id?: number;
  alias?: string;
  name?: string;
}

// --- Inline Create Squad Form ---
function CreateSquadForm({ onSuccess }: { onSuccess: () => void }) {
  // Minimal placeholder for now
  return (
    <form className="max-w-md space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Create Squad</h2>
      <div className="flex gap-2">
        <Button type="button" onClick={onSuccess}>Done</Button>
      </div>
    </form>
  );
}

// --- Inline Edit Squad Form ---
function EditSquadForm({ onSuccess }: { squad: Squad; onSuccess: () => void }) {
  // Minimal placeholder for now
  return (
    <form className="max-w-md space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Edit Squad</h2>
      <div className="flex gap-2">
        <Button type="button" onClick={onSuccess}>Done</Button>
      </div>
    </form>
  );
}

// --- Inline Invite Members Form ---
function InviteMembersForm({ onSuccess }: { squad: Squad; onSuccess: () => void }) {
  // Minimal placeholder for now
  return (
    <form className="max-w-md space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Invite Members</h2>
      <div className="flex gap-2">
        <Button type="button" onClick={onSuccess}>Done</Button>
      </div>
    </form>
  );
}

export default function ScrumMasterDashboard() {
  const [view, setView] = useState<'overview' | 'squad' | 'sprint' | 'settings'>("overview");
  const [squadMenuOpen, setSquadMenuOpen] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(false);
  const [showSprintForm, setShowSprintForm] = useState(false);

  const [squadAction, setSquadAction] = useState<null | 'create' | 'edit' | 'invite'>(null);
  const [selectedSquad] = useState<Squad | null>(null);

  function handleSignOut() {
    // Implement sign out logic here
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
                  <SidebarMenuButton
                    className={view === 'squad' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => {
                      setView('squad');
                      setSquadMenuOpen((open) => !open);
                    }}
                    aria-expanded={squadMenuOpen}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Squad
                  </SidebarMenuButton>
                  {squadMenuOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setView('squad'); setSquadAction('create'); }}>
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
                    className={view === 'sprint' ? 'bg-indigo-50 text-indigo-700' : ''}
                    onClick={() => {
                      setView('sprint');
                      setSprintMenuOpen((open) => !open);
                    }}
                    aria-expanded={sprintMenuOpen}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Sprint
                  </SidebarMenuButton>
                  {sprintMenuOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setShowSprintForm(true)}>
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
            <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 flex-1 flex flex-col">
              {/* Conditional Sprint Creation Form */}
              {showSprintForm && (
                <div className="mb-6">
                  <div className="flex justify-end mb-2">
                    <Button variant="outline" size="sm" onClick={() => setShowSprintForm(false)}>
                      Cancel
                    </Button>
                  </div>
                  <SprintCreationForm />
                </div>
              )}
              {/* Main dashboard content by view */}
              {view === 'overview' && (
                <div className="text-slate-700 text-lg">Overview content goes here.</div>
              )}
              {view === 'squad' && (
                <div className="text-slate-700 text-lg">
                  {/* Squad action views */}
                  {squadAction === null && (
                    <div>Squad list and actions go here.</div>
                  )}
                  {squadAction === 'create' && (
                    <CreateSquadForm onSuccess={() => setSquadAction(null)} />
                  )}
                  {squadAction === 'edit' && selectedSquad && (
                    <EditSquadForm
                      squad={selectedSquad}
                      onSuccess={() => setSquadAction(null)}
                    />
                  )}
                  {squadAction === 'invite' && selectedSquad && (
                    <InviteMembersForm
                      squad={selectedSquad}
                      onSuccess={() => setSquadAction(null)}
                    />
                  )}
                </div>
              )}
              {view === 'sprint' && (
                <div className="text-slate-700 text-lg">Sprint actions and list go here.</div>
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

