"use client"

import { use, useState } from "react"
import { useOccurrence, useUpdateOccurrence, useAddComment } from "@/hooks/use-occurrences"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Dialog } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { categoryLabels, statusLabels, formatDateTime } from "@/lib/utils"
import { MapPin, Clock, Tag, User, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const MiniMap = dynamic(() => import("@/components/map/mini-map").then((m) => m.MiniMap), { ssr: false })

const statusOptions = [
  { value: "OPEN", label: "Aberto" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "RESOLVED", label: "Resolvido" },
]

export default function OccurrenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: occ, isLoading } = useOccurrence(id)
  const updateOcc = useUpdateOccurrence()
  const addComment = useAddComment()

  const [statusDialog, setStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [comment, setComment] = useState("")

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!occ) return <div className="text-danger">Ocorrência não encontrada</div>

  async function handleStatusChange() {
    if (!newStatus) return
    await updateOcc.mutateAsync({ id, data: { status: newStatus } })
    toast.success("Status atualizado")
    setStatusDialog(false)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    await addComment.mutateAsync({ id, content: comment })
    setComment("")
    toast.success("Comentário adicionado")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-text">{occ.title}</h1>
          <div className="flex items-center gap-2">
            <Badge category={occ.category}>{categoryLabels[occ.category] ?? occ.category}</Badge>
            <Badge status={occ.status}>{statusLabels[occ.status] ?? occ.status}</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setNewStatus(occ.status); setStatusDialog(true) }}>
          Alterar status
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left panel */}
        <div className="space-y-6">
          {/* Info */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
            <p className="text-sm text-text">{occ.description}</p>
            <div className="pt-3 border-t border-border space-y-2">
              {[
                { icon: MapPin, value: occ.address },
                { icon: Clock, value: formatDateTime(occ.createdAt) },
                { icon: Tag, value: `#${occ.id.slice(0, 8)}` },
                { icon: User, value: occ.assignedTo?.name ?? "Não atribuído" },
              ].map(({ icon: Icon, value }) => (
                <div key={value} className="flex items-center gap-2 text-sm text-muted">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {occ.history.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-text mb-4">Histórico de status</h2>
              <div className="space-y-3">
                {occ.history.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 text-sm">
                    <Badge status={h.from} className="text-xs">{statusLabels[h.from] ?? h.from}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted" />
                    <Badge status={h.to} className="text-xs">{statusLabels[h.to] ?? h.to}</Badge>
                    <span className="text-xs text-muted ml-auto">{formatDateTime(h.changedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
            <h2 className="text-sm font-semibold text-text">Comentários ({occ.comments.length})</h2>

            <div className="space-y-3">
              {occ.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={c.author.name} image={c.author.image} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 rounded-lg bg-surface-2 px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-text">{c.author.name}</span>
                      <span className="text-xs text-muted">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="space-y-2">
              <Textarea
                placeholder="Adicionar comentário interno..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button type="submit" size="sm" loading={addComment.isPending} disabled={!comment.trim()}>
                Comentar
              </Button>
            </form>
          </div>
        </div>

        {/* Right panel — mini map */}
        <div className="rounded-lg border border-border overflow-hidden h-96 lg:h-auto relative z-0">
          <MiniMap lat={occ.latitude} lng={occ.longitude} title={occ.title} status={occ.status} />
        </div>
      </div>

      {/* Status change dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} title="Alterar status">
        <div className="space-y-4">
          <Select
            label="Novo status"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStatusDialog(false)}>Cancelar</Button>
            <Button onClick={handleStatusChange} loading={updateOcc.isPending} disabled={!newStatus || newStatus === occ.status}>
              Confirmar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
