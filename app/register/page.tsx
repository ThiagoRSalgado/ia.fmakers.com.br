"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    document: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError(data.error || "Erro ao criar conta")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/images/tech-background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-flow-dark-teal/20"></div>

      <Card className="w-full max-w-md text-white rounded-3xl bg-[rgba(26,102,113,0.95)] backdrop-blur-sm border-flow-medium-teal/30 relative z-10 border-transparent">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://modelo1.agenciaart.com.br/wp-content/uploads/2025/08/Logo-Positivo-2.png"
              alt="Flow Makers"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Criar Conta</CardTitle>
          <CardDescription className="text-white/80">
            Cadastre-se para começar a gerenciar seus agentes de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Nome Completo *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-flow-lime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-white">
                Nome da Empresa *
              </Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Nome da sua empresa"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-flow-lime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document" className="text-white">
                CNPJ ou CPF *
              </Label>
              <Input
                id="document"
                name="document"
                value={formData.document}
                onChange={handleChange}
                required
                placeholder="00.000.000/0000-00"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-flow-lime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-flow-lime"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-flow-lime pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90 font-semibold bg-[rgba(232,245,78,1)] text-[rgba(17,68,75,1)]"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/80">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-flow-lime hover:underline font-semibold">
                Entrar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
