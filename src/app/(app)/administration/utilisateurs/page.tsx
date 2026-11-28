import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { UtilisateurActions } from "@/components/administration/utilisateur-actions";
import { initiales } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { UserPlus, ArrowLeft, Search, X } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_VARIANT: Record<string, "primary" | "info" | "success" | "warning" | "neutral"> = {
  ADMIN: "primary",
  MEDECIN: "info",
  PHARMACIEN: "success",
  INFIRMIER: "warning",
  SECRETAIRE: "neutral",
};

/** Normalise pour une recherche insensible à la casse et aux accents. */
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const terme = (q ?? "").trim();

  const [moi, tous] = await Promise.all([
    getSessionUser(),
    prisma.user.findMany({ orderBy: [{ actif: "desc" }, { nom: "asc" }] }),
  ]);

  const mots = norm(terme).split(/\s+/).filter(Boolean);
  const utilisateurs = mots.length
    ? tous.filter((u) => {
        const cible = norm(
          `${u.prenom} ${u.nom} ${u.email} ${ROLE_LABELS[u.role] ?? u.role} ${
            u.specialite ?? ""
          } ${u.telephone ?? ""}`
        );
        return mots.every((m) => cible.includes(m));
      })
    : tous;

  return (
    <div>
      <Link
        href="/administration"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Administration
      </Link>

      <PageHeader
        title="Utilisateurs & rôles"
        description="Gérez les comptes du personnel médical et administratif."
      >
        <Link href="/administration/utilisateurs/nouveau">
          <Button variant="accent">
            <UserPlus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </Link>
      </PageHeader>

      {/* Recherche (formulaire GET : pas de JS requis) */}
      <form
        action="/administration/utilisateurs"
        className="mb-4 flex items-center gap-2"
      >
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={terme}
            placeholder="Rechercher un nom, un email, un rôle…"
            className="pl-9"
            aria-label="Rechercher un utilisateur"
          />
        </div>
        <Button type="submit" variant="outline">
          Rechercher
        </Button>
        {terme && (
          <Link href="/administration/utilisateurs">
            <Button type="button" variant="ghost" size="sm">
              <X className="h-4 w-4" />
              Effacer
            </Button>
          </Link>
        )}
      </form>

      {terme && (
        <p className="mb-3 text-sm text-muted-foreground">
          {utilisateurs.length} résultat{utilisateurs.length > 1 ? "s" : ""} pour
          « {terme} »
        </p>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Contact
                </th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {utilisateurs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Aucun utilisateur ne correspond à cette recherche.
                  </td>
                </tr>
              )}
              {utilisateurs.map((u, i) => (
                <Reveal as="tr" key={u.id} index={i} variant="fade">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initiales(u.prenom, u.nom)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {u.prenom} {u.nom}
                          {moi?.id === u.id && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (vous)
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_VARIANT[u.role] ?? "neutral"}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </Badge>
                    {u.specialite && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {u.specialite}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {u.telephone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.actif ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                        Désactivé
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UtilisateurActions
                      id={u.id}
                      actif={u.actif}
                      estMoi={moi?.id === u.id}
                    />
                  </td>
                </Reveal>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
