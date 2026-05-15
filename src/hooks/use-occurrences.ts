"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { OccurrenceFilters, PaginatedResponse, OccurrenceListItem, OccurrenceWithRelations } from "@/types"

async function fetchOccurrences(filters: OccurrenceFilters): Promise<PaginatedResponse<OccurrenceListItem>> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v))
  })
  const res = await fetch(`/api/occurrences?${params}`)
  if (!res.ok) throw new Error("Failed to fetch occurrences")
  return res.json() as Promise<PaginatedResponse<OccurrenceListItem>>
}

async function fetchOccurrence(id: string): Promise<OccurrenceWithRelations> {
  const res = await fetch(`/api/occurrences/${id}`)
  if (!res.ok) throw new Error("Failed to fetch occurrence")
  return res.json() as Promise<OccurrenceWithRelations>
}

export function useOccurrences(filters: OccurrenceFilters = {}) {
  return useQuery({
    queryKey: ["occurrences", filters],
    queryFn: () => fetchOccurrences(filters),
  })
}

export function useOccurrence(id: string) {
  return useQuery({
    queryKey: ["occurrence", id],
    queryFn: () => fetchOccurrence(id),
    enabled: Boolean(id),
  })
}

export function useCreateOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch("/api/occurrences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create occurrence")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["occurrences"] }),
  })
}

export function useUpdateOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await fetch(`/api/occurrences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update occurrence")
      return res.json()
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ["occurrences"] })
      qc.invalidateQueries({ queryKey: ["occurrence", id] })
    },
  })
}

export function useDeleteOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/occurrences/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete occurrence")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["occurrences"] }),
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await fetch(`/api/occurrences/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error("Failed to add comment")
      return res.json()
    },
    onSuccess: (_d, { id }) => qc.invalidateQueries({ queryKey: ["occurrence", id] }),
  })
}
