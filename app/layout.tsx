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
  title: "Flow Makers - Painel de Gestão de IA",
  description: "Plataforma inteligente de gestão e configuração de Agentes de IA para o mercado de energia",
  generator: "v0.app",
  icons: {
    icon: "https://www.fmakers.com.br/wp-content/uploads/2025/08/Favicon-2.svg",
  },
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
