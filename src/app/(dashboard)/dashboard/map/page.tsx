"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { useOccurrences } from "@/hooks/use-occurrences"
import { Select } from "@/components/ui/select"
import { categoryLabels, statusLabels } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category, Status } from "@/types"

const OccurrenceMap = dynamic(
  () => import("@/components/map/occurrence-map").then((m) => m.OccurrenceMap),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
)

const categoryOptions = [
  { value: "", label: "Todas as categorias" },
  ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
]

const statusOptions = [
  { value: "", label: "Todos os status" },
  ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
]

export default function MapPage() {
  const [category, setCategory] = useState<Category | "">("")
  const [status, setStatus] = useState<Status | "">("")

  const { data, isLoading, isFetching } = useOccurrences({
    category: category || undefined,
    status: status || undefined,
    limit: 500,
  })

  return (
    <div className="flex h-full gap-4 -m-6 p-0 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
      {/* Filters sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-border bg-surface p-4 space-y-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-text">Filtros do mapa</h2>

        <div className="space-y-2">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Total visível</p>
          <p className="text-2xl font-bold text-text">{data?.total ?? 0}</p>
        </div>

        <Select
          label="Categoria"
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "")}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | "")}
        />

        {/* Legend */}
        <div className="pt-2 border-t border-border space-y-2">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Legenda</p>
          {[
            { color: "#dc2626", label: "Aberto" },
            { color: "#d97706", label: "Em andamento" },
            { color: "#16a34a", label: "Resolvido" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-white/30" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ isolation: "isolate" }}>
        {isLoading && <Skeleton className="absolute inset-0 z-10 rounded-none" />}
        {isFetching && !isLoading && (
          <div className="absolute top-3 right-3 z-10 rounded px-2 py-1 text-xs bg-surface border border-border text-muted">
            Atualizando...
          </div>
        )}
        <OccurrenceMap occurrences={data?.data ?? []} />
      </div>
    </div>
  )
}
