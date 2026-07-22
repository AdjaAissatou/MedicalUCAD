import type { LucideIcon } from "lucide-react";
import {
  FolderHeart,
  CalendarCheck,
  Stethoscope,
  Share2,
  Pill,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

/*
 * Section « features » en bento — adaptée d'un composant 21st.dev
 * (« Feature Section with Bento Grid » par @tommyjepsen) à la charte
 * UCAD Santé : palette teal médicale, 6 modules réels, révélation au scroll.
 */

type Module = {
  icon: LucideIcon;
  titre: string;
  desc: string;
  wide?: boolean; // cellule large (2 colonnes) pour le rythme bento
};

const MODULES: Module[] = [
  {
    icon: FolderHeart,
    titre: "Dossiers médicaux",
    desc: "Fiches patients complètes : antécédents, allergies, groupe sanguin et historiques, centralisés et sécurisés.",
    wide: true,
  },
  {
    icon: CalendarCheck,
    titre: "Rendez-vous",
    desc: "Planification, filtres et suivi des statuts, regroupés par jour.",
  },
  {
    icon: Stethoscope,
    titre: "Consultations",
    desc: "Historique, constantes vitales et diagnostics.",
  },
  {
    icon: Share2,
    titre: "Orientations",
    desc: "Redirections vers spécialistes et structures externes.",
  },
  {
    icon: Pill,
    titre: "Pharmacie",
    desc: "Stock, seuils d'alerte, ruptures et péremptions.",
  },
  {
    icon: LayoutDashboard,
    titre: "Tableau de bord",
    desc: "Statistiques, rendez-vous du jour et alertes de pharmacie — toute l'activité du service en un coup d'œil.",
    wide: true,
  },
];

export function FeaturesBento() {
  return (
    <section id="modules" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <ScrollReveal className="flex flex-col items-start gap-4">
        <Badge variant="primary">La plateforme</Badge>
        <h2 className="max-w-xl text-left text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Tout le parcours de soin, réuni
        </h2>
        <p className="max-w-xl text-left text-lg leading-relaxed text-muted-foreground">
          Six modules qui couvrent l&apos;ensemble du service médical
          universitaire, du premier rendez-vous à la délivrance des médicaments.
        </p>
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m, i) => (
          <ScrollReveal
            key={m.titre}
            delay={(i % 4) * 80}
            className={m.wide ? "h-full lg:col-span-2" : "h-full"}
          >
            <article
              className={[
                "card-hover group flex h-full min-h-52 flex-col justify-between rounded-2xl border border-border p-6 shadow-sm",
                m.wide
                  ? "bg-gradient-to-br from-secondary/60 to-card"
                  : "bg-card",
              ].join(" ")}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <m.icon className="h-6 w-6 stroke-[1.75]" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {m.titre}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {m.desc}
                </p>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
