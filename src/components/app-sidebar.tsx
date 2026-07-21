"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Share2,
  Pill,
  HeartPulse,
  ShieldCheck,
  X,
} from "lucide-react";

const NAV = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/patients", label: "Dossiers médicaux", icon: Users },
  { href: "/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/consultations", label: "Consultations", icon: Stethoscope },
  { href: "/orientations", label: "Orientations", icon: Share2 },
  { href: "/pharmacie", label: "Pharmacie", icon: Pill },
];

export function AppSidebar({
  open,
  onClose,
  isAdmin = false,
}: {
  open?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const nav = isAdmin
    ? [
        ...NAV,
        {
          href: "/administration",
          label: "Administration",
          icon: ShieldCheck,
        },
      ]
    : NAV;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <Link href="/tableau-de-bord" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">UCAD Santé</p>
              <p className="text-[11px] text-muted-foreground">
                Services Médicaux
              </p>
            </div>
          </Link>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Université Cheikh Anta Diop
            <br />
            de Dakar — Sénégal
          </p>
        </div>
      </aside>
    </>
  );
}
