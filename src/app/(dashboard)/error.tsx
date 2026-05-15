"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <AlertTriangle className="h-12 w-12 text-danger" />
      <div>
        <h2 className="text-lg font-semibold text-text">Algo deu errado</h2>
        <p className="text-sm text-muted mt-1">{error.message ?? "Erro inesperado"}</p>
      </div>
      <Button onClick={reset} variant="outline">Tentar novamente</Button>
    </div>
  )
}
