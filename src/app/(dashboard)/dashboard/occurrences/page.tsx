"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOccurrences, useUpdateOccurrence, useDeleteOccurrence } from "@/hooks/use-occurrences"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { categoryLabels, statusLabels, formatDate } from "@/lib/utils"
import { Plus, Download, ChevronUp, ChevronDown, Trash2, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Category, Status, OccurrenceFilters } from "@/types"

const categoryOptions = [
  { value: "", label: "Categoria" },
  ...Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l })),
]

const statusOptions = [
  { value: "", label: "Status" },
  ...Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l })),
]

const statusChangeOptions = [
  { value: "OPEN", label: "Aberto" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "RESOLVED", label: "Resolvido" },
]

export default function OccurrencesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<OccurrenceFilters>({ page: 1, limit: 20, sortOrder: "desc" })
  const [selected, setSelected] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState("")

  const { data, isLoading } = useOccurrences(filters)
  const updateOcc = useUpdateOccurrence()
  const deleteOcc = useDeleteOccurrence()

  function setFilter<K extends keyof OccurrenceFilters>(key: K, value: OccurrenceFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }))
  }

  function toggleSort(field: string) {
    setFilters((f) => ({
      ...f,
      sortBy: field,
      sortOrder: f.sortBy === field && f.sortOrder === "desc" ? "asc" : "desc",
    }))
  }

  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function toggleAll() {
    const ids = data?.data.map((o) => o.id) ?? []
    setSelected((s) => (s.length === ids.length ? [] : ids))
  }

  async function applyBulkStatus() {
    if (!bulkStatus || selected.length === 0) return
    await Promise.all(selected.map((id) => updateOcc.mutateAsync({ id, data: { status: bulkStatus } })))
    setSelected([])
    toast.success(`${selected.length} ocorrência(s) atualizada(s)`)
  }

  function exportCSV() {
    if (!data) return
    const cols = ["ID", "Título", "Categoria", "Status", "Endereço", "Data"]
    const rows = data.data.map((o) => [
      o.id,
      `"${o.title}"`,
      categoryLabels[o.category] ?? o.category,
      statusLabels[o.status] ?? o.status,
      `"${o.address}"`,
      formatDate(o.createdAt),
    ])
    const csv = [cols, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ocorrencias.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function SortIcon({ field }: { field: string }) {
    if (filters.sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />
    return filters.sortOrder === "asc"
      ? <ChevronUp className="h-3 w-3 ml-1 text-accent" />
      : <ChevronDown className="h-3 w-3 ml-1 text-accent" />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text">Ocorrências</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
          <Link href="/dashboard/occurrences/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Nova
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Buscar..."
          value={filters.search ?? ""}
          onChange={(e) => setFilter("search", e.target.value)}
          className="w-52"
        />
        <Select
          options={categoryOptions}
          value={filters.category ?? ""}
          onChange={(e) => setFilter("category", (e.target.value as Category) || undefined)}
          className="w-36"
        />
        <Select
          options={statusOptions}
          value={filters.status ?? ""}
          onChange={(e) => setFilter("status", (e.target.value as Status) || undefined)}
          className="w-36"
        />
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
          <span className="text-sm text-text font-medium">{selected.length} selecionada(s)</span>
          <Select
            options={[{ value: "", label: "Alterar status para..." }, ...statusChangeOptions]}
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="w-48"
          />
          <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus} loading={updateOcc.isPending}>
            Aplicar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === data?.data.length && selected.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border accent-accent"
                  />
                </th>
                {[
                  { label: "Título", field: "title" },
                  { label: "Categoria", field: "category" },
                  { label: "Status", field: "status" },
                  { label: "Endereço", field: null },
                  { label: "Data", field: "createdAt" },
                  { label: "Responsável", field: null },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide ${field ? "cursor-pointer hover:text-text" : ""}`}
                    onClick={field ? () => toggleSort(field) : undefined}
                  >
                    <span className="flex items-center">
                      {label}
                      {field && <SortIcon field={field} />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.data.map((occ) => (
                    <tr
                      key={occ.id}
                      className="border-b border-border hover:bg-surface-2 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/occurrences/${occ.id}`)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(occ.id)}
                          onChange={() => toggleSelect(occ.id)}
                          className="rounded border-border accent-accent"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-text max-w-48 truncate">{occ.title}</td>
                      <td className="px-4 py-3">
                        <Badge category={occ.category}>{categoryLabels[occ.category] ?? occ.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={occ.status}>{statusLabels[occ.status] ?? occ.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted max-w-48 truncate">{occ.address}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(occ.createdAt)}</td>
                      <td className="px-4 py-3">
                        {occ.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={occ.assignedTo.name} image={occ.assignedTo.image} size="sm" />
                            <span className="text-xs text-muted truncate max-w-24">{occ.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={async () => {
                            if (!confirm("Excluir esta ocorrência?")) return
                            await deleteOcc.mutateAsync(occ.id)
                            toast.success("Ocorrência excluída")
                          }}
                          className="p-1.5 text-muted hover:text-danger rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted">
              {data.total} ocorrência(s) · página {data.page} de {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page === 1}
                onClick={() => setFilter("page", (filters.page ?? 1) - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page === data.totalPages}
                onClick={() => setFilter("page", (filters.page ?? 1) + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
