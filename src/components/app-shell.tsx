"use client";

import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { UserMenu } from "./user-menu";
import { Menu } from "lucide-react";
import type { SessionUser } from "@/lib/session";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur px-4 sm:px-6">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <UserMenu user={user} />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
