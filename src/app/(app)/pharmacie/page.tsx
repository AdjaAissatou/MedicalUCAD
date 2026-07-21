import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/utils";
import { Pill, TriangleAlert, PackageCheck, PackageX } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PharmaciePage() {
  const medicaments = await prisma.medicament.findMany({
    orderBy: { nom: "asc" },
  });

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
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.color}`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {medicaments.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Aucun médicament en stock"
          description="Le catalogue de la pharmacie apparaîtra ici."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Médicament</th>
                  <th className="px-4 py-3 font-medium">Forme</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Seuil</th>
                  <th className="px-4 py-3 font-medium">Péremption</th>
                  <th className="px-4 py-3 font-medium text-right">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {medicaments.map((m) => {
                  const rupture = m.stock === 0;
                  const alerte = m.stock <= m.seuilAlerte;
                  return (
                    <tr key={m.id} className="hover:bg-muted/50">
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
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {m.stock}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {m.seuilAlerte}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.datePeremption ? formatDate(m.datePeremption) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rupture ? (
                          <Badge variant="destructive">Rupture</Badge>
                        ) : alerte ? (
                          <Badge variant="warning">Stock bas</Badge>
                        ) : (
                          <Badge variant="success">Disponible</Badge>
                        )}
                      </td>
                    </tr>
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
