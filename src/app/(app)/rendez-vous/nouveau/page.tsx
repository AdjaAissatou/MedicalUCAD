import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { RdvForm } from "@/components/rendez-vous/rdv-form";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NouveauRendezVousPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const { patient } = await searchParams;

  const [patients, medecins] = await Promise.all([
    prisma.patient.findMany({
      orderBy: { nom: "asc" },
      select: { id: true, nom: true, prenom: true, matricule: true },
    }),
    prisma.user.findMany({
      where: { role: "MEDECIN", actif: true },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true, prenom: true, specialite: true, role: true },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <Link
        href="/rendez-vous"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux rendez-vous
      </Link>
      <PageHeader
        title="Nouveau rendez-vous"
        description="Planifiez un rendez-vous entre un patient et un médecin."
      />

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun patient enregistré"
          description="Vous devez d'abord créer un dossier patient avant de planifier un rendez-vous."
        >
          <Link href="/patients/nouveau">
            <Button variant="accent">Créer un patient</Button>
          </Link>
        </EmptyState>
      ) : (
        <RdvForm
          patientPreselect={patient}
          patients={patients.map((p) => ({
            id: p.id,
            label: `${p.prenom} ${p.nom}`,
            sous: p.matricule,
          }))}
          medecins={medecins.map((m) => ({
            id: m.id,
            label: `Dr ${m.prenom} ${m.nom}`,
            sous: m.specialite ?? ROLE_LABELS[m.role],
          }))}
        />
      )}
    </div>
  );
}
