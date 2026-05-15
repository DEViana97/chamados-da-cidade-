import { Card, CardTitle } from "@/components/ui/card"
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import type { DashboardMetrics } from "@/types"

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

const cards = [
  {
    key: "totalOpen" as const,
    label: "Ocorrências abertas",
    icon: TrendingUp,
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    key: "resolvedThisMonth" as const,
    label: "Resolvidas este mês",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    key: "avgResolutionDays" as const,
    label: "Tempo médio (dias)",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    format: (v: number) => v.toFixed(1),
  },
  {
    key: "criticalPending" as const,
    label: "Críticas pendentes",
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
]

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, bg, format }) => (
        <Card key={key} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle>{label}</CardTitle>
            <div className={`rounded-md p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-text tabular-nums">
            {format ? format(metrics[key]) : metrics[key]}
          </p>
        </Card>
      ))}
    </div>
  )
}
