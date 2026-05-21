"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { useUsers, useUpdateUser } from "@/hooks/use-users"
import { useNotificationPreferences, useUpdatePreference } from "@/hooks/use-notifications"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@/types"

type Tab = "profile" | "notifications" | "team"

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Perfil" },
  { id: "notifications", label: "Notificações" },
  { id: "team", label: "Equipe" },
]

const roleOptions = [
  { value: "ANALYST", label: "Analista" },
  { value: "ADMIN", label: "Administrador" },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>("profile")

  const isAdmin = session?.user?.role === "ADMIN"
  const { data: users } = useUsers()
  const updateUser = useUpdateUser()
  const { data: preferences = [] } = useNotificationPreferences()
  const updatePreference = useUpdatePreference()

  async function handleRoleChange(userId: string, role: string) {
    await updateUser.mutateAsync({ id: userId, role })
    toast.success("Papel atualizado")
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-lg font-semibold text-text">Configurações</h1>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs
          .filter((t) => t.id !== "team" || isAdmin)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-text",
              )}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Profile */}
      {activeTab === "profile" && (
        <div className="rounded-lg border border-border bg-surface p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar name={session?.user?.name} image={session?.user?.image} size="lg" />
            <div>
              <p className="font-medium text-text">{session?.user?.name}</p>
              <p className="text-sm text-muted">{session?.user?.email}</p>
              <Badge role={session?.user?.role} className="mt-1">
                {session?.user?.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <Input label="Nome" defaultValue={session?.user?.name ?? ""} placeholder="Seu nome" />
            <Input label="Email" defaultValue={session?.user?.email ?? ""} disabled />
            <Input label="Nova senha" type="password" placeholder="Deixe em branco para manter" />
            <Input label="Confirmar senha" type="password" placeholder="Confirme a nova senha" />
            <Button onClick={() => toast.success("Perfil atualizado!")}>Salvar alterações</Button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text">Preferências de notificação</h2>
          {(
            [
              { type: "OCCURRENCE_CREATED" as NotificationType, label: "Nova ocorrência criada", desc: "Notificação ao registrar nova ocorrência" },
              { type: "STATUS_CHANGED" as NotificationType, label: "Status atualizado", desc: "Notificação ao mudar status de ocorrência" },
              { type: "COMMENT_ADDED" as NotificationType, label: "Novo comentário", desc: "Notificação ao adicionar comentário" },
            ]
          ).map(({ type, label, desc }) => {
            const pref = preferences.find((p) => p.type === type)
            const enabled = pref?.enabled ?? true
            return (
              <label key={type} className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer">
                <div>
                  <p className="text-sm text-text">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    updatePreference.mutate(
                      { type, enabled: e.target.checked },
                      { onSuccess: () => toast.success("Preferência atualizada") },
                    )
                  }}
                  className="h-4 w-4 accent-accent rounded"
                />
              </label>
            )
          })}
        </div>
      )}

      {/* Team (ADMIN only) */}
      {activeTab === "team" && isAdmin && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-text">Gerenciamento de equipe</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {["Usuário", "Email", "Papel", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={user.name} image={user.image} size="sm" />
                      <span className="text-text">{user.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <Select
                      options={roleOptions}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === session?.user?.id}
                      className="w-36"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge role={user.role}>{user.role}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
