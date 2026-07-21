import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { UtilisateurActions } from "@/components/administration/utilisateur-actions";
import { initiales } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { UserPlus, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_VARIANT: Record<string, "primary" | "info" | "success" | "warning" | "neutral"> = {
  ADMIN: "primary",
  MEDECIN: "info",
  PHARMACIEN: "success",
  INFIRMIER: "warning",
  SECRETAIRE: "neutral",
};

export default async function UtilisateursPage() {
  const [moi, utilisateurs] = await Promise.all([
    getSessionUser(),
    prisma.user.findMany({ orderBy: [{ actif: "desc" }, { nom: "asc" }] }),
  ]);

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
