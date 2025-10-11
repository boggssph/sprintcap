"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Target, BarChart3 } from "lucide-react";
import SprintCreationDrawer from "@/components/SprintCreationDrawer";
import SprintList from "@/components/SprintList";
import SquadsTab from "@/components/SquadsTab";
import CapacityPlanTab from "@/components/CapacityPlanTab";
import ScrumMasterHeader from "@/components/ScrumMasterHeader";
import CenteredContainer from '@/components/CenteredContainer'
import MainShell from '@/components/MainShell'

// --- Main Component ---
export default function ScrumMasterDashboard() {
  const [sprintDrawerOpen, setSprintDrawerOpen] = useState(false)
  const [sprintRefreshTrigger, setSprintRefreshTrigger] = useState(0)

  // Convert squads to the format expected by SprintCreationForm
  // Note: Squads are now managed by the SquadsTab component

  const handleSprintCreated = () => {
    setSprintRefreshTrigger(prev => prev + 1)
  }

  return (
    <MainShell>
      <CenteredContainer>
        <ScrumMasterHeader />
        <Tabs defaultValue="squads" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="squads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Squads
            </TabsTrigger>
            <TabsTrigger value="sprints" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sprints
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Capacity
            </TabsTrigger>
          </TabsList>
          <TabsContent value="squads" className="space-y-6">
            <SquadsTab />
          </TabsContent>
          <TabsContent value="sprints" className="space-y-6">
            <SprintList
              refreshTrigger={sprintRefreshTrigger}
              onCreateSprint={() => setSprintDrawerOpen(true)}
            />
          </TabsContent>
          <TabsContent value="capacity" className="space-y-6">
            <CapacityPlanTab />
          </TabsContent>
        </Tabs>

        <SprintCreationDrawer
          open={sprintDrawerOpen}
          onOpenChange={setSprintDrawerOpen}
          onSprintCreated={handleSprintCreated}
        />
      </CenteredContainer>
    </MainShell>
  );
}
