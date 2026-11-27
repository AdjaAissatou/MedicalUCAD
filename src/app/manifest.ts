import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UCAD Medical — Services Médicaux",
    short_name: "UCAD Medical",
    description:
      "Services médicaux de l'Université Cheikh Anta Diop de Dakar : rendez-vous, dossier médical, consultations.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#123b35",
    theme_color: "#087f72",
    lang: "fr",
    categories: ["health", "medical", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
