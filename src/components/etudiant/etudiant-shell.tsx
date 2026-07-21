"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, initiales } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import {
  Home,
  CalendarDays,
  FileHeart,
  Stethoscope,
  User,
  HeartPulse,
  LogOut,
} from "lucide-react";
import type { SessionUser } from "@/lib/session";

const NAV = [
  { href: "/espace-etudiant", label: "Accueil", icon: Home, exact: true },
  { href: "/espace-etudiant/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/espace-etudiant/dossier", label: "Dossier", icon: FileHeart },
  { href: "/espace-etudiant/consultations", label: "Suivi", icon: Stethoscope },
  { href: "/espace-etudiant/profil", label: "Profil", icon: User },
];

function actif(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function EtudiantShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href="/espace-etudiant" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-4.5 w-4.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-foreground">
                UCAD Santé
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Espace étudiant
              </span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const a = actif(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    a
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-foreground">
                {user.prenom} {user.nom}
              </span>
              <span className="text-[11px] text-muted-foreground">Étudiant</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initiales(user.prenom, user.nom)}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Se déconnecter"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main
        key={pathname}
        className="reveal-fade mx-auto max-w-3xl px-4 pb-28 pt-6 md:pb-10"
      >
        {children}
      </main>

      {/* Barre d'onglets mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-stretch justify-around">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const a = actif(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                  a ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={a ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", a && "scale-110")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
