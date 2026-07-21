"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { ajusterStock, supprimerMedicament } from "@/app/actions/medicaments";
import { Minus, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";

export function StockActions({ id }: { id: string }) {
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
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => startTransition(() => ajusterStock(id, -1))}
        disabled={pending}
        aria-label="Retirer une unité"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 cursor-pointer"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => startTransition(() => ajusterStock(id, 1))}
        disabled={pending}
        aria-label="Ajouter une unité"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={pending}
          aria-label="Plus d'actions"
          aria-haspopup="menu"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {open && (
          <div
            role="menu"
            className="reveal-scale absolute right-0 z-50 mt-1 w-44 rounded-lg border border-border bg-card p-1.5 shadow-lg"
          >
            <Link
              href={`/pharmacie/${id}/modifier`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
              role="menuitem"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
            <button
              onClick={() => {
                if (confirm("Supprimer ce médicament du catalogue ?")) {
                  startTransition(() => supprimerMedicament(id));
                }
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
              role="menuitem"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
