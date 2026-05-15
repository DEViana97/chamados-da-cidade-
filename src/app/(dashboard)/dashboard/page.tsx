"use client"

import { useDashboardMetrics } from "@/hooks/use-dashboard"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { DashboardCharts } from "@/components/dashboard/charts"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardMetrics()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-danger text-sm">Erro ao carregar dados do dashboard</div>
  }

  return (
    <div className="space-y-6">
      <MetricsCards metrics={data.metrics} />
      <DashboardCharts
        daily={data.charts.daily}
        byCategory={data.charts.byCategory}
        byStatus={data.charts.byStatus}
      />
    </div>
  )
}
