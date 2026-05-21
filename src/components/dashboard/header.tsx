"use client"

import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import { LogOut, User, ChevronRight } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { NotificationPanel } from "@/components/dashboard/notification-panel"
import { useState } from "react"

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  map: "Mapa",
  occurrences: "Ocorrências",
  settings: "Configurações",
  new: "Nova ocorrência",
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  return segments.map((seg, i) => ({
    label: breadcrumbLabels[seg] ?? (seg.length === 25 ? "Detalhe" : seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    last: i === segments.length - 1,
  }))
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const crumbs = buildBreadcrumbs(pathname)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 flex-shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted" />}
            <span className={crumb.last ? "text-text font-medium" : "text-muted"}>{crumb.label}</span>
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationPanel />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-2 transition-colors"
          >
            <Avatar name={session?.user?.name} image={session?.user?.image} size="sm" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-52 rounded-lg border border-border bg-surface shadow-xl">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text truncate">{session?.user?.name}</p>
                  <p className="text-xs text-muted truncate">{session?.user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    className="flex w-full items-center gap-2 px-2 py-2 text-sm text-muted hover:text-text hover:bg-surface-2 rounded transition-colors"
                    onClick={() => { setMenuOpen(false); router.push("/dashboard/settings") }}
                  >
                    <User className="h-4 w-4" />
                    Perfil
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-2 py-2 text-sm text-danger hover:bg-danger/10 rounded transition-colors"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
