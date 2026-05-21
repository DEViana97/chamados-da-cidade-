import { z } from "zod"

export const createOccurrenceSchema = z.object({
  title: z.string().min(3, { error: "Título deve ter ao menos 3 caracteres" }).max(100),
  description: z.string().min(10, { error: "Descrição deve ter ao menos 10 caracteres" }).max(500),
  category: z.enum(["POTHOLE", "GARBAGE", "LIGHTING", "OTHER"], {
    error: "Categoria inválida",
  }),
  latitude: z.number().min(-90).max(90).refine((v) => v !== 0, { message: "Selecione uma localização no mapa" }),
  longitude: z.number().min(-180).max(180).refine((v) => v !== 0, { message: "Selecione uma localização no mapa" }),
  address: z.string().min(5, { error: "Endereço é obrigatório" }),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

export const updateOccurrenceSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  userId: z.string().cuid().optional().nullable(),
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
})

export const addCommentSchema = z.object({
  content: z.string().min(1, { error: "Comentário não pode ser vazio" }).max(1000),
})

export const filterSchema = z.object({
  search: z.string().optional(),
  category: z.enum(["POTHOLE", "GARBAGE", "LIGHTING", "OTHER"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type CreateOccurrenceInput = z.infer<typeof createOccurrenceSchema>
export type UpdateOccurrenceInput = z.infer<typeof updateOccurrenceSchema>
export type AddCommentInput = z.infer<typeof addCommentSchema>
export type FilterInput = z.infer<typeof filterSchema>
