"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UcadLogoMark } from "@/components/brand/ucad-logo";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { peutAccederModule, accueilParRole } from "@/lib/authz";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CalendarDays,
  Stethoscope,
  Share2,
  Pill,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import type { SessionUser } from "@/lib/session";

const NAV = [
  { href: "/tableau-de-bord", cle: "tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/supervision", cle: "supervision", label: "Supervision", icon: BarChart3 },
  { href: "/patients", cle: "patients", label: "Dossiers", icon: Users },
  { href: "/rendez-vous", cle: "rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/consultations", cle: "consultations", label: "Consultations", icon: Stethoscope },
  { href: "/orientations", cle: "orientations", label: "Orientations", icon: Share2 },
  { href: "/pharmacie", cle: "pharmacie", label: "Pharmacie", icon: Pill },
  { href: "/administration", cle: "administration", label: "Administration", icon: ShieldCheck },
] as const;

function actif(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = NAV.filter((item) =>
    peutAccederModule({ role: user.role }, item.cle)
  );

  return (
    <div className="min-h-screen app-canvas">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link
            href={accueilParRole(user)}
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
              <UcadLogoMark className="h-6 w-6" />
            </span>
            <span className="hidden text-base font-bold text-foreground sm:block">
              UCAD <span className="text-gold">Medical</span>
            </span>
          </Link>

          {/* Navigation horizontale (desktop) */}
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {nav.map(({ href, label, icon: Icon }) => {
              const a = actif(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    a
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={a ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
            <ThemeToggle />
            <UserMenu user={user} />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden cursor-pointer"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation mobile (tiroir) */}
        {open && (
          <nav className="space-y-1 border-t border-border bg-card/95 px-4 py-2 md:hidden">
            {nav.map(({ href, label, icon: Icon }) => {
              const a = actif(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    a
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={a ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* La clé sur pathname force le rejeu de l'animation à chaque navigation */}
      <main
        key={pathname}
        className="reveal-fade mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"
      >
        {children}
      </main>
    </div>
  );
}
