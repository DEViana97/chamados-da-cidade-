"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, List, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useSession } from "next-auth/react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/map", label: "Mapa", icon: Map },
  { href: "/dashboard/occurrences", label: "Ocorrências", icon: List },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-surface transition-all duration-200 flex-shrink-0",
        collapsed ? "w-14" : "w-60",
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-14 items-center border-b border-border px-4", collapsed && "justify-center px-0")}>
        {collapsed ? (
          <span className="text-accent font-bold text-lg">C</span>
        ) : (
          <span className="text-text font-semibold text-base tracking-tight">
            Chamados da<span className="text-accent"> Cidade</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded px-2 py-2 text-sm transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-text hover:bg-surface-2",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      {!collapsed && session?.user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <Avatar name={session.user.name} image={session.user.image} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text truncate font-medium">{session.user.name ?? "Usuário"}</p>
              <Badge role={session.user.role} className="mt-0.5">
                {session.user.role}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center h-10 border-t border-border text-muted hover:text-text hover:bg-surface-2 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
