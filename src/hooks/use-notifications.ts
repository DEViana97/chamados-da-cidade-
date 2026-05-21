"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AppNotification, NotificationPreference } from "@/types"

async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await fetch("/api/notifications")
  if (!res.ok) throw new Error("Failed to fetch notifications")
  return res.json() as Promise<AppNotification[]>
}

async function fetchPreferences(): Promise<NotificationPreference[]> {
  const res = await fetch("/api/notifications/preferences")
  if (!res.ok) throw new Error("Failed to fetch preferences")
  return res.json() as Promise<NotificationPreference[]>
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  })
}

export function useUnreadCount() {
  const { data } = useNotifications()
  return data?.filter((n) => !n.read).length ?? 0
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to mark as read")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (!res.ok) throw new Error("Failed to mark all as read")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: fetchPreferences,
  })
}

export function useUpdatePreference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ type, enabled }: { type: string; enabled: boolean }) => {
      const res = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, enabled }),
      })
      if (!res.ok) throw new Error("Failed to update preference")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences"] }),
  })
}
