import Link from "next/link";
import { optionsMedecins } from "@/lib/options";
import { ReservationForm } from "@/components/etudiant/reservation-form";
import { EmptyState } from "@/components/empty-state";
import { ArrowLeft, UserX } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NouvelleReservation() {
  const medecins = await optionsMedecins();

  return (
    <div>
      <Link
        href="/espace-etudiant/rendez-vous"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Prendre un rendez-vous
      </h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Choisissez un médecin et le créneau qui vous convient.
      </p>

      {medecins.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="Aucun médecin disponible"
          description="Revenez plus tard ou contactez le service médical."
        />
      ) : (
        <ReservationForm medecins={medecins} />
      )}
    </div>
  );
}
