import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { age, formatDate } from "@/lib/utils";
import { TYPE_PATIENT_LABELS } from "@/lib/constants";
import { Droplet, TriangleAlert, FileHeart } from "lucide-react";

export const dynamic = "force-dynamic";

function Bloc({ titre, valeur }: { titre: string; valeur?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {titre}
      </dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
        {valeur?.trim() ? valeur : "—"}
      </dd>
    </div>
  );
}

export default async function MonDossier() {
  const user = await getSessionUser();
  const patient = await prisma.patient.findUnique({
    where: { id: user!.patientId! },
    include: { dossier: true },
  });
  const d = patient?.dossier;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileHeart className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mon dossier médical
          </h1>
          <p className="text-sm text-muted-foreground">
            Consultation en lecture seule. Contactez le service pour toute
            correction.
          </p>
        </div>
      </div>

      {/* Identité */}
      <Reveal>
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Matricule</p>
              <p className="font-medium text-foreground">{patient?.matricule}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium text-foreground">
                {patient ? TYPE_PATIENT_LABELS[patient.type] : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Âge</p>
              <p className="font-medium text-foreground">
                {age(patient?.dateNaissance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dossier n°</p>
              <p className="font-medium text-foreground">
                {d?.numeroDossier ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* Constantes clés */}
      <Reveal index={1}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplet className="h-4 w-4" /> Groupe sanguin
              </span>
              {d?.groupeSanguin ? (
                <Badge variant="destructive">{d.groupeSanguin}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TriangleAlert className="h-4 w-4 text-amber-600" /> Allergies
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {d?.allergies?.trim() ? d.allergies : "Aucune connue"}
              </p>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {/* Antécédents */}
      <Reveal index={2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Antécédents & traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Bloc titre="Antécédents médicaux" valeur={d?.antecedentsMedicaux} />
              <Bloc
                titre="Antécédents chirurgicaux"
                valeur={d?.antecedentsChirurgicaux}
              />
              <Bloc
                titre="Antécédents familiaux"
                valeur={d?.antecedentsFamiliaux}
              />
              <Bloc titre="Traitement en cours" valeur={d?.traitementEnCours} />
            </dl>
          </CardContent>
        </Card>
      </Reveal>

      <p className="text-center text-xs text-muted-foreground">
        Mis à jour le {d ? formatDate(d.updatedAt) : "—"}
      </p>
    </div>
  );
}
