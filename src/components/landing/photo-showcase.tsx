import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { ParallaxImage } from "@/components/landing/parallax-image";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const U = "https://images.unsplash.com/photo-";
const Q = "?auto=format&fit=crop&w=1200&q=70";

type Bloc = {
  eyebrow: string;
  titre: string;
  desc: string;
  points: string[];
  img: string;
  alt: string;
  reverse?: boolean;
};

const BLOCS: Bloc[] = [
  {
    eyebrow: "Proximité",
    titre: "Un accompagnement humain, au plus près des étudiants",
    desc: "Chaque étudiant dispose d'un espace personnel : prise de rendez-vous, accès à son dossier, suivi de ses consultations — pour des soins simples et sans file d'attente.",
    points: [
      "Prise de rendez-vous en ligne",
      "Dossier médical accessible 24/7",
      "Rappels et suivi personnalisés",
    ],
    img: `${U}1541178735493-479c1a27ed24${Q}`,
    alt: "Étudiant consultant son espace santé en ligne",
  },
  {
    eyebrow: "Coordination",
    titre: "Des soins coordonnés, du campus à l'hôpital",
    desc: "Médecins, infirmiers, pharmacie et administration partagent la même information en temps réel. Les orientations vers les spécialistes se font en un clic, sans ressaisie.",
    points: [
      "Équipe soignante synchronisée",
      "Orientations vers les structures externes",
      "Pharmacie et stocks reliés au dossier",
    ],
    img: `${U}1666214280557-f1b5022eb634${Q}`,
    alt: "Soignants analysant un dossier médical",
    reverse: true,
  },
];

export function PhotoShowcase() {
  return (
    <section className="mx-auto max-w-6xl space-y-24 px-6 py-24">
      {BLOCS.map((b) => (
        <div
          key={b.titre}
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <ScrollReveal
            variant={b.reverse ? "right" : "left"}
            className={b.reverse ? "lg:order-2" : ""}
          >
            <ParallaxImage
              src={b.img}
              alt={b.alt}
              className="aspect-[4/3] shadow-xl shadow-primary/10 ring-1 ring-border"
            />
          </ScrollReveal>

          <ScrollReveal
            variant={b.reverse ? "left" : "right"}
            className={b.reverse ? "lg:order-1" : ""}
          >
            <Badge variant="primary">{b.eyebrow}</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {b.titre}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {b.desc}
            </p>
            <ul className="mt-6 space-y-3">
              {b.points.map((pt) => (
                <li key={pt} className="flex items-start gap-3 text-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      ))}
    </section>
  );
}
