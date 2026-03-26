"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, User, LogOut, Plus, Lightbulb } from "lucide-react"
import type { User as UserType } from "@/types/user"
import { TemplateManagerDialog } from "./template-manager-dialog"
import { PromptSuggestionsDialog } from "./prompt-suggestions-dialog"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false)
  const [promptSuggestionsOpen, setPromptSuggestionsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-flow-dark-teal text-white shadow-lg bg-[rgba(17,68,75,1)]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-white">Painel IA</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white hover:text-flow-lime transition-colors font-medium">
              Dashboard
            </a>
            {user?.role === "admin" && (
              <a href="/gestao-usuarios" className="text-white hover:text-flow-lime transition-colors font-medium">
                Gestão de Usuários
              </a>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-flow-medium-teal rounded-full animate-pulse"></div>
            ) : user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-flow-medium-teal"
                  onClick={() => setPromptSuggestionsOpen(true)}
                  title="Sugestões de Prompts IA"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
                {user.role === "admin" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-white hover:bg-flow-medium-teal"
                    onClick={() => setTemplateManagerOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full hover:bg-flow-medium-teal pointer-events-auto z-50 focus:outline-none focus:ring-2 focus:ring-flow-lime"
                      onClick={(e) => {
                        console.log("[v0] Avatar button clicked")
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-flow-lime text-flow-dark-teal font-semibold bg-[rgba(232,245,78,1)] text-[rgba(17,68,75,1)] pointer-events-none">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 z-50" align="end" forceMount sideOffset={5}>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/perfil")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-flow-lime text-flow-lime hover:bg-flow-lime hover:text-flow-dark-teal bg-transparent"
                  onClick={() => router.push("/login")}
                >
                  Entrar
                </Button>
                <Button
                  className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90"
                  onClick={() => router.push("/register")}
                >
                  Cadastrar
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white z-50 focus:outline-none focus:ring-2 focus:ring-flow-lime"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50" sideOffset={5}>
                <DropdownMenuItem onClick={() => router.push("/")}>Dashboard</DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/gestao-usuarios")}>Gestão de Usuário</DropdownMenuItem>
                )}
                {user && (
                  <DropdownMenuItem onClick={() => setPromptSuggestionsOpen(true)}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Sugestões IA
                  </DropdownMenuItem>
                )}
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => setTemplateManagerOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Fluxo
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                    <DropdownMenuItem onClick={() => router.push("/perfil")}>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/login")}>Entrar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/register")}>Cadastrar</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <TemplateManagerDialog open={templateManagerOpen} onOpenChange={setTemplateManagerOpen} />
      <PromptSuggestionsDialog
        open={promptSuggestionsOpen}
        onOpenChange={setPromptSuggestionsOpen}
        user={user}
        onPromptUpdated={() => {
          window.location.reload()
        }}
      />
    </header>
  )
}
