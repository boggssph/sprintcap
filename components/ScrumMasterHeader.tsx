"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

export default function ScrumMasterHeader({ onSignOut }: { onSignOut: () => void }) {
  const { data: session } = useSession();
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
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
      <Button onClick={onSignOut} variant="outline" size="sm" className="border-slate-300 mt-2 md:mt-0">
        Sign Out
      </Button>
    </header>
  );
}
