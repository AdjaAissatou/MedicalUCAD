"use client";

import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/app/actions/auth";
import { initiales } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { LogOut, ChevronDown } from "lucide-react";
import type { SessionUser } from "@/lib/session";

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 hover:bg-muted transition-colors cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {initiales(user.prenom, user.nom)}
        </span>
        <span className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-foreground">
            {user.prenom} {user.nom}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {ROLE_LABELS[user.role] ?? user.role}
            {user.specialite ? ` · ${user.specialite}` : ""}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg p-1.5 z-50"
        >
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium text-foreground truncate">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
