"use client";
import React, { useState, useEffect } from "react";
import { toast } from 'sonner'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Target } from "lucide-react";
import SprintCreationForm from "@/components/SprintCreationForm";
import ScrumMasterHeader from "@/components/ScrumMasterHeader";
import CenteredContainer from '@/components/CenteredContainer'
import MainShell from '@/components/MainShell'

// --- Types ---
interface Squad {
  id?: string | number;
  alias?: string;
  name?: string;
  memberCount?: number;
}

// --- Simplified Create Squad Form ---
function CreateSquadForm({ onSuccess, refreshSquads }: { onSuccess: () => void; refreshSquads?: () => Promise<void> }) {
  const [name, setName] = React.useState("");
  const [alias, setAlias] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !alias.trim()) {
      toast.error('Name and alias are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), alias: alias.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create squad');
      toast.success('Squad created successfully');
      setName("");
      setAlias("");
      onSuccess();
      refreshSquads?.();
    } catch (error) {
      toast.error('Failed to create squad');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Squad</CardTitle>
        <CardDescription>Add a new team squad to manage</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Squad Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., Frontend Team"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., FE"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Squad'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Squads List ---
function SquadsList({ squads }: { squads: Squad[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Squads</CardTitle>
        <CardDescription>Manage your team squads</CardDescription>
      </CardHeader>
      <CardContent>
        {squads.length === 0 ? (
          <p className="text-gray-500">No squads created yet.</p>
        ) : (
          <div className="space-y-2">
            {squads.map((squad) => (
              <div key={squad.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{squad.name}</p>
                  <p className="text-sm text-gray-500">{squad.alias} • {squad.memberCount} members</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Component ---
export default function ScrumMasterDashboard() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSquads = async () => {
    try {
      const res = await fetch('/api/squads');
      if (res.ok) {
        const data = await res.json();
        setSquads(data);
      }
    } catch (error) {
      toast.error('Failed to load squads');
    }
  };

  useEffect(() => {
    refreshSquads().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <MainShell>
        <CenteredContainer>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </CenteredContainer>
      </MainShell>
    );
  }

  // Convert squads to the format expected by SprintCreationForm
  const sprintFormSquads = squads.map(squad => ({
    id: String(squad.id),
    name: squad.name || '',
    alias: squad.alias,
    memberCount: squad.memberCount || 0,
  }));

  return (
    <MainShell>
      <CenteredContainer>
        <ScrumMasterHeader />
        <Tabs defaultValue="squads" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="squads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Squads
            </TabsTrigger>
            <TabsTrigger value="sprints" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sprints
            </TabsTrigger>
          </TabsList>
          <TabsContent value="squads" className="space-y-6">
            <CreateSquadForm onSuccess={() => {}} refreshSquads={refreshSquads} />
            <SquadsList squads={squads} />
          </TabsContent>
          <TabsContent value="sprints" className="space-y-6">
            <SprintCreationForm squadsProp={sprintFormSquads} />
            {/* Sprint list would go here */}
          </TabsContent>
        </Tabs>
      </CenteredContainer>
    </MainShell>
  );
}
