"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, Edit, Trash2, Shield, UserIcon, Plus } from "lucide-react"
import type { User } from "@/types/user"
import { Header } from "@/components/header"

export default function GestaoUsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const router = useRouter()

  const [editFormData, setEditFormData] = useState({
    name: "",
    company_name: "",
    cpf_cnpj: "",
    email: "",
    role: "user" as "admin" | "user",
    is_active: true,
  })

  const [createFormData, setCreateFormData] = useState({
    name: "",
    company_name: "",
    cpf_cnpj: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createFormData),
      })

      if (response.ok) {
        await loadUsers()
        setCreateDialogOpen(false)
        setCreateFormData({
          name: "",
          company_name: "",
          cpf_cnpj: "",
          email: "",
          password: "",
        })
      } else {
        alert("Erro ao criar usuário")
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      alert("Erro ao criar usuário")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      company_name: user.company_name,
      cpf_cnpj: user.document,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    })
    setEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        await loadUsers()
        setEditDialogOpen(false)
        setEditingUser(null)
      } else {
        alert("Erro ao atualizar usuário")
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      alert("Erro ao atualizar usuário")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadUsers()
      } else {
        alert("Erro ao excluir usuário")
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      alert("Erro ao excluir usuário")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-flow-dark-teal rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="h-8 w-8 text-flow-dark-teal" />
                Gestão de Usuários
              </h1>
              <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-flow-dark-teal hover:bg-flow-dark-teal/90 text-white bg-[rgba(17,68,75,1)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Usuário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-flow-dark-teal" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.is_active).length}</p>
                  </div>
                  <UserIcon className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Administradores</p>
                    <p className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "admin").length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl">
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
              <CardDescription>Lista completa de todos os usuários cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-4xl bg-[rgba(17,68,75,1)]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-flow-dark-teal rounded-full flex items-center justify-center font-semibold bg-[rgba(232,245,78,1)] text-emerald-950">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "??"}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[rgba(232,245,78,1)]">{user.name}</h3>
                        <p className="text-sm text-white">{user.email}</p>
                        <p className="text-sm text-white">{user.company_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        className="bg-[rgba(230,244,77,1)] text-black"
                        variant={user.role === "admin" ? "default" : "secondary"}
                      >
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </Badge>
                      <Badge
                        className="bg-[rgba(232,245,78,1)] text-black"
                        variant={user.is_active ? "default" : "destructive"}
                      >
                        {user.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={user.id === currentUser?.id}
                              className="hover:text-red-700 bg-red-600 text-white border-none"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o usuário {user.name}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>Preencha as informações para criar um novo usuário</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="create-name" className="text-right">
                    Nome Completo
                  </Label>
                  <Input
                    id="create-name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="create-company" className="text-right">
                    Nome da Empresa
                  </Label>
                  <Input
                    id="create-company"
                    value={createFormData.company_name}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="create-cpf" className="text-right">
                    CPF ou CNPJ
                  </Label>
                  <Input
                    id="create-cpf"
                    value={createFormData.cpf_cnpj}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, cpf_cnpj: e.target.value }))}
                    className="col-span-3"
                    placeholder="CPF ou CNPJ"
                  />
                </div>
                <div className="grid grid-cols-4 items-center text-center gap-0">
                  <Label htmlFor="create-email" className="text-right justify-end mx-3">
                    Email
                  </Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="col-span-3"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="create-password" className="text-right justify-end">
                    Senha
                  </Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="col-span-3"
                    placeholder="Senha do usuário"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateUser}
                  className="bg-flow-dark-teal hover:bg-flow-dark-teal/90 bg-[rgba(17,68,75,1)]"
                >
                  Criar Usuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>Altere as informações do usuário {editingUser?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">
                    Empresa
                  </Label>
                  <Input
                    id="company"
                    value={editFormData.company_name}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Função
                  </Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value: "admin" | "user") => setEditFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editFormData.is_active ? "active" : "inactive"}
                    onValueChange={(value) => setEditFormData((prev) => ({ ...prev, is_active: value === "active" }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveUser}
                  className="bg-flow-dark-teal hover:bg-flow-dark-teal/90 bg-[rgba(17,68,75,1)]"
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
