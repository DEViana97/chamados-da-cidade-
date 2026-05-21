"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useCreateOccurrence } from "@/hooks/use-occurrences"
import { createOccurrenceSchema, type CreateOccurrenceInput } from "@/lib/validations/occurrence"
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"
import { categoryLabels } from "@/lib/utils"

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-surface-2 animate-pulse" /> },
)

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))

const steps = ["Dados básicos", "Localização", "Revisão"]

export default function NewOccurrencePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const createOcc = useCreateOccurrence()

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<CreateOccurrenceInput>({
    resolver: zodResolver(createOccurrenceSchema),
    defaultValues: { latitude: 0, longitude: 0, category: "OTHER" },
  })

  const stepFields: (keyof CreateOccurrenceInput)[][] = [
    ["title", "description", "category"],
    ["address", "latitude", "longitude"],
  ]

  async function handleNext() {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => s + 1)
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch()

  async function onSubmit(data: CreateOccurrenceInput) {
    const result = await createOcc.mutateAsync(data)
    toast.success("Ocorrência criada com sucesso!")
    router.push(`/dashboard/occurrences/${(result as { id: string }).id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text">Nova ocorrência</h1>
        <p className="text-sm text-muted mt-0.5">Preencha os dados em 3 etapas</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step
                    ? "bg-success text-white"
                    : i === step
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${i === step ? "text-text" : "text-muted"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 -mt-4 transition-colors ${i < step ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-surface p-6 space-y-5">
        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4">
            <Input
              {...register("title")}
              label="Título"
              placeholder="Ex: Buraco na Rua X"
              error={errors.title?.message}
            />
            <Textarea
              {...register("description")}
              label="Descrição"
              placeholder="Descreva o problema em detalhes..."
              rows={4}
              error={errors.description?.message}
            />
            <Select
              {...register("category")}
              label="Categoria"
              options={categoryOptions}
              error={errors.category?.message}
            />
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              {...register("address")}
              label="Endereço"
              placeholder="Ex: Rua X, 123 — Fortaleza, CE"
              error={errors.address?.message}
            />
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wide mb-2">
                Clique no mapa para marcar a localização
              </p>
              <div className="h-72 rounded-lg overflow-hidden border border-border">
                <LocationPicker
                  lat={values.latitude || -3.7172}
                  lng={values.longitude || -38.5433}
                  onSelect={(lat, lng) => {
                    setValue("latitude", lat, { shouldValidate: true })
                    setValue("longitude", lng, { shouldValidate: true })
                  }}
                />
              </div>
              {values.latitude !== 0 && (
                <p className="text-xs text-muted mt-1">
                  Coordenadas: {values.latitude.toFixed(6)}, {values.longitude.toFixed(6)}
                </p>
              )}
              {(errors.latitude || errors.longitude) && (
                <p className="text-xs text-danger mt-1">Selecione uma localização no mapa</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text">Confirmar dados</h3>
            {[
              { label: "Título", value: values.title },
              { label: "Categoria", value: categoryLabels[values.category] ?? values.category },
              { label: "Descrição", value: values.description },
              { label: "Endereço", value: values.address },
              { label: "Coordenadas", value: `${values.latitude?.toFixed(6)}, ${values.longitude?.toFixed(6)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 py-2 border-b border-border last:border-0">
                <span className="text-xs text-muted w-24 flex-shrink-0 pt-0.5">{label}</span>
                <span className="text-sm text-text">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {step < 2 ? (
            <Button
              type="button"
              onClick={handleNext}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" loading={createOcc.isPending}>
              Criar ocorrência
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
