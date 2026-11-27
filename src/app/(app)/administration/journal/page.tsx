import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatDateHeure } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JournalAuditPage() {
  const entrees = await prisma.journalAudit.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="Journal d'audit"
        description="Traçabilité des accès et des modifications (200 dernières entrées)."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <ScrollText className="h-4 w-4" />
          Audit
        </span>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {entrees.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="Journal vide"
              description="Les accès et modifications s'afficheront ici."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Auteur</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Cible</th>
                    <th className="px-4 py-3 font-medium">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {entrees.map((e) => (
                    <tr key={e.id} className="border-b border-border/60">
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDateHeure(e.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground">
                          {e.userEmail ?? "—"}
                        </span>
                        {e.userRole && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({ROLE_LABELS[e.userRole] ?? e.userRole})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground">
                          {e.action}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {e.cible ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {e.details ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
