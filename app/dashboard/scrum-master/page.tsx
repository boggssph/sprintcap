"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Target } from "lucide-react";
import SprintCreationForm from "@/components/SprintCreationForm";
import SquadsTab from "@/components/SquadsTab";
import ScrumMasterHeader from "@/components/ScrumMasterHeader";
import CenteredContainer from '@/components/CenteredContainer'
import MainShell from '@/components/MainShell'

// --- Main Component ---
export default function ScrumMasterDashboard() {
  // Convert squads to the format expected by SprintCreationForm
  // Note: Squads are now managed by the SquadsTab component
  const sprintFormSquads: Array<{ id: string; name: string; alias?: string; memberCount: number }> = [];

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
            <SquadsTab />
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
