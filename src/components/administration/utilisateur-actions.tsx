"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  basculerActivation,
  supprimerUtilisateur,
} from "@/app/actions/utilisateurs";
import { MoreVertical, Pencil, Power, Trash2 } from "lucide-react";

export function UtilisateurActions({
  id,
  actif,
  estMoi,
}: {
  id: string;
  actif: boolean;
  estMoi: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
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
        disabled={pending}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        aria-label="Actions"
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="reveal-scale absolute right-0 z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1.5 shadow-lg"
        >
          <Link
            href={`/administration/utilisateurs/${id}/modifier`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
            role="menuitem"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>

          {!estMoi && (
            <>
              <button
                onClick={() =>
                  startTransition(async () => {
                    await basculerActivation(id);
                    setOpen(false);
                  })
                }
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                role="menuitem"
              >
                <Power className="h-4 w-4" />
                {actif ? "Désactiver" : "Réactiver"}
              </button>

              <button
                onClick={() => {
                  if (
                    confirm(
                      "Supprimer définitivement cet utilisateur ? Cette action est irréversible."
                    )
                  ) {
                    startTransition(() => supprimerUtilisateur(id));
                  }
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
                role="menuitem"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
