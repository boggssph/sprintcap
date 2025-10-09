"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50 flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Avatar className="h-9 w-9">
          <AvatarImage src={(session?.user as { image?: string })?.image} />
          <AvatarFallback className="bg-red-100 text-red-700">
            {(session?.user as { displayName?: string, name?: string })?.displayName?.charAt(0) ||
              (session?.user as { name?: string })?.name?.charAt(0) ||
              session?.user?.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {/* Visible app title on small screens for context */}
        <div className="ml-2 md:hidden">
          <div className="text-sm font-semibold text-slate-800">SprintCap</div>
          <div className="text-xs text-slate-500">Admin</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 md:mt-0">
        <Button onClick={() => signOut({ callbackUrl: '/auth/no-access' })} variant="ghost" size="sm" className="border-slate-200 px-3 py-1">
          <span className="sr-only">Sign out</span>
          Sign Out
        </Button>
      </div>
    </header>
  );
}