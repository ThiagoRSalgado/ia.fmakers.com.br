"use client"

import type React from "react"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Building, Key, Eye, EyeOff } from "lucide-react"
import type { User as UserType } from "@/types/user"

export default function PerfilPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showOpenAIToken, setShowOpenAIToken] = useState(false)
  const [showElevenLabsToken, setShowElevenLabsToken] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    cpf_cnpj: "",
    email: "",
    about_company: "",
    openai_token: "",
    elevenlabs_token: "",
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setFormData({
          name: data.user.name || "",
          company_name: data.user.company_name || "",
          cpf_cnpj: data.user.cpf_cnpj || "",
          email: data.user.email || "",
          about_company: data.user.about_company || "",
          openai_token: data.user.openai_token || "",
          elevenlabs_token: data.user.elevenlabs_token || "",
        })
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        alert("Perfil atualizado com sucesso!")
      } else {
        alert("Erro ao atualizar perfil")
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      alert("Erro ao atualizar perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-flow-dark-teal rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e configurações da conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>Suas informações básicas de identificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100 text-gray-600"
                      placeholder="seu@email.com"
                    />
                    <p className="text-sm text-gray-500">O email não pode ser alterado pois é usado para login</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf_cnpj">CPF ou CNPJ</Label>
                  <Input
                    id="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={(e) => handleInputChange("cpf_cnpj", e.target.value)}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>Detalhes sobre sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_role">Função Atual</Label>
                  <Input
                    id="current_role"
                    value={
                      user?.role === "admin"
                        ? "Administrador"
                        : user?.role === "manager"
                          ? "Gerente"
                          : user?.role === "developer"
                            ? "Desenvolvedor"
                            : "Usuário"
                    }
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                  <p className="text-sm text-gray-500">Apenas administradores podem alterar funções de usuários</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about_company">Sobre a Empresa</Label>
                  <Textarea
                    id="about_company"
                    value={formData.about_company}
                    onChange={(e) => handleInputChange("about_company", e.target.value)}
                    placeholder="Descreva sua empresa, área de atuação, etc..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tokens de API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Tokens de API
                </CardTitle>
                <CardDescription>Configure seus tokens para integração com serviços de IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai_token">Token OpenAI</Label>
                  <div className="relative">
                    <Input
                      id="openai_token"
                      type={showOpenAIToken ? "text" : "password"}
                      value={formData.openai_token}
                      onChange={(e) => handleInputChange("openai_token", e.target.value)}
                      placeholder="sk-..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowOpenAIToken(!showOpenAIToken)}
                    >
                      {showOpenAIToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elevenlabs_token">Token ElevenLabs</Label>
                  <div className="relative">
                    <Input
                      id="elevenlabs_token"
                      type={showElevenLabsToken ? "text" : "password"}
                      value={formData.elevenlabs_token}
                      onChange={(e) => handleInputChange("elevenlabs_token", e.target.value)}
                      placeholder="el_..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowElevenLabsToken(!showElevenLabsToken)}
                    >
                      {showElevenLabsToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-flow-dark-teal hover:bg-flow-dark-teal/90 bg-[rgba(17,68,75,1)]"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
