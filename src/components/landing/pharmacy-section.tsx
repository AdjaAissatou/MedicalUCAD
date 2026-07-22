import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { PillsCanvas } from "@/components/landing/three/pills-canvas";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Stock et seuils d'alerte en temps réel",
  "Ruptures et péremptions signalées automatiquement",
  "Dispensation reliée au dossier patient",
];

export function PharmacySection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <ScrollReveal variant="left">
          <Badge variant="primary">Pharmacie</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Une pharmacie reliée au dossier
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Le stock, les alertes et la dispensation sont connectés au reste de
            la plateforme. Plus de rupture qui passe inaperçue, plus de
            médicament périmé oublié sur une étagère.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal variant="right">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-card to-secondary ring-1 ring-border">
            <PillsCanvas />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
