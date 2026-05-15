"use client"

import { useQuery } from "@tanstack/react-query"

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Failed to fetch dashboard data")
      return res.json() as Promise<{
        metrics: {
          totalOpen: number
          resolvedThisMonth: number
          avgResolutionDays: number
          criticalPending: number
        }
        charts: {
          daily: { date: string; count: number }[]
          byCategory: { category: string; count: number }[]
          byStatus: { status: string; count: number }[]
        }
      }>
    },
    staleTime: 60_000,
  })
}
