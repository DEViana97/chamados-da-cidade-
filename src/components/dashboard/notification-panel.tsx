"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, Info } from "lucide-react"
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from "@/hooks/use-notifications"
import type { AppNotification } from "@/types"

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function NotificationItem({ notification, onClose }: { notification: AppNotification; onClose: () => void }) {
  const router = useRouter()
  const markRead = useMarkRead()

  function handleClick() {
    if (!notification.read) {
      markRead.mutate(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
      onClose()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-2 transition-colors ${!notification.read ? "bg-accent/5" : ""}`}
    >
      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read ? "bg-accent" : "bg-transparent"}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.read ? "font-medium text-text" : "text-muted"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted mt-0.5 line-clamp-2">{notification.body}</p>
      </div>
      <span className="text-xs text-muted flex-shrink-0 mt-0.5">{timeAgo(notification.createdAt)}</span>
    </button>
  )
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const { data: notifications = [] } = useNotifications()
  const unreadCount = useUnreadCount()
  const markAllRead = useMarkAllRead()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-muted hover:text-text hover:bg-surface-2 rounded transition-colors relative"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-80 rounded-lg border border-border bg-surface shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-text">
                Notificações{unreadCount > 0 && <span className="ml-1.5 text-xs text-accent">({unreadCount})</span>}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="flex items-center gap-1 text-xs text-muted hover:text-text transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-muted">
                  <Info className="h-8 w-8 opacity-40" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onClose={() => setOpen(false)} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
