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
  ShieldCheck,
  BarChart3,
  X,
} from "lucide-react";
import { UcadLogoMark } from "@/components/brand/ucad-logo";
import { peutAccederModule } from "@/lib/authz";

const NAV = [
  { href: "/tableau-de-bord", cle: "tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/supervision", cle: "supervision", label: "Supervision", icon: BarChart3 },
  { href: "/patients", cle: "patients", label: "Dossiers médicaux", icon: Users },
  { href: "/rendez-vous", cle: "rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/consultations", cle: "consultations", label: "Consultations", icon: Stethoscope },
  { href: "/orientations", cle: "orientations", label: "Orientations", icon: Share2 },
  { href: "/pharmacie", cle: "pharmacie", label: "Pharmacie", icon: Pill },
  { href: "/administration", cle: "administration", label: "Administration", icon: ShieldCheck },
] as const;

export function AppSidebar({
  open,
  onClose,
  role,
}: {
  open?: boolean;
  onClose?: () => void;
  role: string;
}) {
  const pathname = usePathname();
  // Navigation filtrée par rôle : chaque profil ne voit que ses modules.
  const nav = NAV.filter((item) => peutAccederModule({ role }, item.cle));

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
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-5">
          <Link href="/tableau-de-bord" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-white/15">
              <UcadLogoMark className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">
                UCAD <span className="text-gold">Medical</span>
              </p>
              <p className="text-[11px] text-sidebar-foreground/60">
                Espace de gestion médicale
              </p>
            </div>
          </Link>
          <button
            className="lg:hidden text-sidebar-foreground/70 hover:text-white cursor-pointer"
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
                    ? "bg-emerald text-white shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-white/10 hover:text-white"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-[11px] text-sidebar-foreground/55 leading-relaxed">
            Université Cheikh Anta Diop
            <br />
            de Dakar — Sénégal
          </p>
        </div>
      </aside>
    </>
  );
}
