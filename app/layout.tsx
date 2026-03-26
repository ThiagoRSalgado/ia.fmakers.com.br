import type React from "react"
import type { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "./globals.css"

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
})

export const metadata: Metadata = {
  title: "Painel de Gestão de IA",
  description: "Plataforma inteligente de gestão e configuração de Agentes de IA",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={bricolageGrotesque.variable}>
      <body className="font-bricolage antialiased">{children}</body>
    </html>
  )
}
