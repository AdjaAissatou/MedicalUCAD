import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { gerePharmacie } from "@/lib/authz";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { AnimatedNumber } from "@/components/animated-number";
import { StockActions } from "@/components/pharmacie/stock-actions";
import { formatDate } from "@/lib/utils";
import { Pill, TriangleAlert, PackageCheck, PackageX, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PharmaciePage() {
  const [user, medicaments] = await Promise.all([
    getSessionUser(),
    prisma.medicament.findMany({ orderBy: { nom: "asc" } }),
  ]);
  const peutGerer = gerePharmacie(user);

  const enAlerte = medicaments.filter((m) => m.stock <= m.seuilAlerte);
  const enRupture = medicaments.filter((m) => m.stock === 0);

  const stats = [
    {
      label: "Références",
      value: medicaments.length,
      icon: PackageCheck,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Sous le seuil",
      value: enAlerte.length,
      icon: TriangleAlert,
      color: "text-amber-700 bg-amber-100",
    },
    {
      label: "En rupture",
      value: enRupture.length,
      icon: PackageX,
      color: "text-red-700 bg-red-100",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pharmacie"
        description="Stock de médicaments, seuils d'alerte et dates de péremption."
      >
        {peutGerer && (
          <Link href="/pharmacie/nouveau">
            <Button variant="accent">
              <Plus className="h-4 w-4" />
              Nouveau médicament
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} index={i}>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.color}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedNumber value={s.value} />
                  </p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      {medicaments.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Aucun médicament en stock"
          description="Le catalogue de la pharmacie apparaîtra ici."
        >
          {peutGerer && (
            <Link href="/pharmacie/nouveau">
              <Button variant="accent">
                <Plus className="h-4 w-4" />
                Ajouter un médicament
              </Button>
            </Link>
          )}
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Médicament</th>
                  <th className="px-4 py-3 font-medium">Forme</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    Péremption
                  </th>
                  <th className="px-4 py-3 font-medium">État</th>
                  {peutGerer && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {medicaments.map((m, i) => {
                  const rupture = m.stock === 0;
                  const alerte = m.stock <= m.seuilAlerte;
                  const ratio = m.seuilAlerte
                    ? Math.min(100, (m.stock / (m.seuilAlerte * 2)) * 100)
                    : 100;
                  return (
                    <Reveal
                      as="tr"
                      key={m.id}
                      index={i}
                      variant="fade"
                      className="hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{m.nom}</p>
                        {m.dci && (
                          <p className="text-xs text-muted-foreground">
                            {m.dci}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {[m.forme, m.dosage].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 font-medium text-foreground">
                            {m.stock}
                          </span>
                          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block">
                            <div
                              className={`bar-grow h-full rounded-full ${
                                rupture
                                  ? "bg-destructive"
                                  : alerte
                                    ? "bg-warning"
                                    : "bg-success"
                              }`}
                              style={{ width: `${Math.max(4, ratio)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {m.datePeremption ? formatDate(m.datePeremption) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {rupture ? (
                          <Badge variant="destructive">Rupture</Badge>
                        ) : alerte ? (
                          <Badge variant="warning">Stock bas</Badge>
                        ) : (
                          <Badge variant="success">Disponible</Badge>
                        )}
                      </td>
                      {peutGerer && (
                        <td className="px-4 py-3">
                          <StockActions id={m.id} />
                        </td>
                      )}
                    </Reveal>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
