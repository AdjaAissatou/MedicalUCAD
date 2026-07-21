import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UCAD Santé — Services Médicaux",
    short_name: "UCAD Santé",
    description:
      "Services médicaux de l'Université Cheikh Anta Diop de Dakar : rendez-vous, dossier médical, consultations.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#062e2c",
    theme_color: "#0891b2",
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
