import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UCAD Santé — Services Médicaux",
  description:
    "Plateforme de gestion des services médicaux de l'Université Cheikh Anta Diop de Dakar : dossiers médicaux, rendez-vous, consultations, orientations et pharmacie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
