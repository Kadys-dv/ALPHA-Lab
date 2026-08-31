import type { Metadata } from "next";
import "./globals.css";
import "./hardening.css";
import "./accessibility.css";
import "./template-accessibility.css";

const productionUrl = "https://alpha-builders-web.cskadys.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: {
    default: "ALPHA Builders",
    template: "%s | ALPHA Builders",
  },
  description:
    "Laboratório open source para transformar contribuições públicas em evidências técnicas verificáveis de portfólio na Base Sepolia.",
  alternates: { canonical: "/" },
  applicationName: "ALPHA Builders",
  keywords: [
    "open source",
    "portfólio de desenvolvedor",
    "GitHub",
    "Base Sepolia",
    "Web3",
    "ALPHA Builders",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "ALPHA Builders",
    title: "ALPHA Builders — Aprenda construindo. Prove contribuindo.",
    description:
      "Contribuições públicas, revisão humana e evidências técnicas verificáveis — sem venda de token ou promessa financeira.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALPHA Builders — Aprenda construindo. Prove contribuindo.",
    description:
      "Contribuições públicas, revisão humana e evidências técnicas verificáveis em testnet.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#main-content">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
