import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { initiales, formatDate } from "@/lib/utils";
import { Stethoscope, Plus, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const consultations = await prisma.consultation.findMany({
    include: { patient: true, medecin: true },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Consultations"
        description="Historique des consultations réalisées par le service médical."
      >
        <Link href="/consultations/nouvelle">
          <Button variant="accent">
            <Plus className="h-4 w-4" />
            Nouvelle consultation
          </Button>
        </Link>
      </PageHeader>

      {consultations.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="Aucune consultation"
          description="Les consultations réalisées lors des rendez-vous apparaîtront ici."
        >
          <Link href="/consultations/nouvelle">
            <Button variant="accent">
              <Plus className="h-4 w-4" />
              Nouvelle consultation
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <Card>
          <CardContent className="p-2">
            <ul className="divide-y divide-border">
              {consultations.map((c, i) => (
                <Reveal as="li" key={c.id} index={i} variant="fade" className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/patients/${c.patientId}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold hover:opacity-80"
                    >
                      {initiales(c.patient.prenom, c.patient.nom)}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/patients/${c.patientId}`}
                          className="truncate text-sm font-medium text-foreground hover:underline"
                        >
                          {c.patient.prenom} {c.patient.nom}
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(c.date)}
                          </span>
                          <Link
                            href={`/consultations/${c.id}/modifier`}
                            className="text-muted-foreground hover:text-primary"
                            aria-label="Modifier la consultation"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">
                        {c.motif ?? "Consultation"}
                      </p>
                      {c.diagnostic && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          <span className="font-medium">Diagnostic :</span>{" "}
                          {c.diagnostic}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Dr {c.medecin.prenom} {c.medecin.nom}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
