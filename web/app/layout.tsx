import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ALPHA Builders", description: "Laboratório público para transformar projetos em evidências verificáveis de portfólio." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
