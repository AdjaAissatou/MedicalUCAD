import type { NextConfig } from "next";

// En-têtes de sécurité HTTP appliqués à toutes les routes.
// Content-Security-Policy : autorise uniquement les ressources de l'origine.
// 'unsafe-inline' est nécessaire aux styles générés par Next.js / Tailwind.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" +
    (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images : origine + data/blob (canvas, WebGL) + hébergeur photo autorisé.
  "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com",
  "connect-src 'self'",
  // blob: requis par certains workers de three.js / @react-three/drei.
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
]
  .join("; ")
  .concat(process.env.NODE_ENV === "production" ? "; upgrade-insecure-requests" : "");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // masque l'en-tête X-Powered-By
  images: {
    // Hébergeurs photo autorisés pour next/image (cohérent avec la CSP img-src).
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
