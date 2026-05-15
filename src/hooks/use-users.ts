"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json() as Promise<{
        id: string
        name: string | null
        email: string
        image: string | null
        role: string
        createdAt: string
      }[]>
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; role?: string }) => {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update user")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}
