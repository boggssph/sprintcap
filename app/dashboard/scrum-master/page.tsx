"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Users, Settings, Plus } from "lucide-react";
import SprintCreationForm from "@/components/SprintCreationForm";

export default function ScrumMasterDashboard() {
  const { data: session } = useSession();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/" });
  };

  return (
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
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setShowSprintForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sprint
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="h-4 w-4 mr-2" />
                  Squad
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
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
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <span className="sr-only">Open sidebar</span>
                <Target className="h-6 w-6 text-indigo-600" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={(session?.user as { image?: string })?.image} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700">
                  {(session?.user as { displayName?: string, name?: string })?.displayName?.charAt(0) ||
                    (session?.user as { name?: string })?.name?.charAt(0) ||
                    session?.user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="border-slate-300 mt-2 md:mt-0">
              Sign Out
            </Button>
          </header>

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
            {/* Main dashboard content placeholder */}
            <div className="text-slate-700 text-lg">Welcome to your Scrum Master Dashboard.</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

