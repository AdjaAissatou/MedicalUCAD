import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { formatDate } from "@/lib/utils";
import {
  STATUT_EXAMEN_LABELS,
  STATUT_EXAMEN_VARIANTS,
} from "@/lib/constants";
import { Stethoscope, Share2, ArrowRight, FlaskConical } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUT_ORIENTATION: Record<
  string,
  { label: string; variant: "info" | "success" | "neutral" }
> = {
  EN_ATTENTE: { label: "En attente", variant: "info" },
  REALISEE: { label: "Réalisée", variant: "success" },
  ANNULEE: { label: "Annulée", variant: "neutral" },
};

export default async function MonSuivi() {
  const user = await getSessionUser();
  const patientId = user!.patientId!;

  const [consultations, orientations, examens] = await Promise.all([
    prisma.consultation.findMany({
      where: { patientId },
      include: { medecin: true },
      orderBy: { date: "desc" },
    }),
    prisma.orientation.findMany({
      where: { patientId },
      include: { medecin: true },
      orderBy: { date: "desc" },
    }),
    prisma.demandeExamen.findMany({
      where: { patientId },
      include: { resultat: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mon suivi médical
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vos consultations et orientations.
        </p>
      </div>

      {/* Consultations */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Stethoscope className="h-4 w-4 text-primary" /> Consultations
        </h2>
        {consultations.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="Aucune consultation"
            description="Vos consultations passées apparaîtront ici."
          />
        ) : (
          <div className="space-y-2">
            {consultations.map((c, i) => (
              <Reveal key={c.id} index={i} variant="fade">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {c.motif ?? "Consultation"}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(c.date)}
                      </span>
                    </div>
                    {c.diagnostic && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Diagnostic :
                        </span>{" "}
                        {c.diagnostic}
                      </p>
                    )}
                    {c.traitement && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Traitement :
                        </span>{" "}
                        {c.traitement}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Dr {c.medecin.prenom} {c.medecin.nom}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Orientations */}
      {orientations.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Share2 className="h-4 w-4 text-primary" /> Orientations
          </h2>
          <div className="space-y-2">
            {orientations.map((o, i) => {
              const st =
                STATUT_ORIENTATION[o.statut] ?? STATUT_ORIENTATION.EN_ATTENTE;
              return (
                <Reveal key={o.id} index={i} variant="fade">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          <ArrowRight className="h-3.5 w-3.5 text-primary" />
                          {o.serviceCible}
                        </p>
                        <Badge variant={st.variant} dot>
                          {st.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {o.motif}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(o.date)} · Dr {o.medecin.prenom}{" "}
                        {o.medecin.nom}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Examens & résultats */}
      {examens.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <FlaskConical className="h-4 w-4 text-primary" /> Examens & résultats
          </h2>
          <div className="space-y-2">
            {examens.map((e, i) => (
              <Reveal key={e.id} index={i} variant="fade">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{e.type}</p>
                      <Badge variant={STATUT_EXAMEN_VARIANTS[e.statut]}>
                        {STATUT_EXAMEN_LABELS[e.statut] ?? e.statut}
                      </Badge>
                    </div>
                    {e.resultat?.conclusion && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Conclusion :
                        </span>{" "}
                        {e.resultat.conclusion}
                      </p>
                    )}
                    {e.resultat?.valeurs && (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {e.resultat.valeurs}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(e.date)}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
