import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

type Temoignage = {
  citation: string;
  nom: string;
  role: string;
  initiales: string;
  couleur: string;
};

const TEMOIGNAGES: Temoignage[] = [
  {
    citation:
      "Je prends rendez-vous en deux minutes depuis mon téléphone, et j'ai tout mon dossier sous la main. Fini les files d'attente au service médical.",
    nom: "Aïssatou Faye",
    role: "Étudiante en Licence, Faculté des Sciences",
    initiales: "AF",
    couleur: "bg-primary/15 text-primary",
  },
  {
    citation:
      "Les dossiers sont enfin centralisés. Je vois les antécédents, les allergies et les consultations passées immédiatement — la prise en charge est plus sûre.",
    nom: "Dr Awa Diallo",
    role: "Médecin coordinatrice, Service médical UCAD",
    initiales: "AD",
    couleur: "bg-accent/15 text-accent",
  },
  {
    citation:
      "La pharmacie est reliée aux dossiers : les alertes de stock et les péremptions remontent toutes seules. On gagne un temps précieux chaque jour.",
    nom: "Cheikh Diop",
    role: "Pharmacien",
    initiales: "CD",
    couleur: "bg-[#0e7490]/15 text-[#0e7490]",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <Badge variant="primary">Ils l&apos;utilisent</Badge>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Étudiants et soignants, même plateforme
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Pensée avec la communauté de l&apos;UCAD, pour simplifier le quotidien
          de chacun.
        </p>
      </ScrollReveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {TEMOIGNAGES.map((t, i) => (
          <ScrollReveal key={t.nom} delay={i * 100}>
            <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-sm">
              <Quote className="h-8 w-8 text-primary/30" />
              <blockquote className="mt-4 flex-1 text-foreground">
                « {t.citation} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${t.couleur}`}
                  aria-hidden
                >
                  {t.initiales}
                </span>
                <span>
                  <span className="block font-semibold text-foreground">
                    {t.nom}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
