import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z.string().min(1, { error: "Senha é obrigatória" }),
})

export const registerSchema = z.object({
  name: z.string().min(2, { error: "Nome deve ter ao menos 2 caracteres" }).trim(),
  email: z.email({ error: "Email inválido" }).trim(),
  password: z
    .string()
    .min(8, { error: "Senha deve ter ao menos 8 caracteres" })
    .regex(/[a-zA-Z]/, { error: "Senha deve conter ao menos uma letra" })
    .regex(/[0-9]/, { error: "Senha deve conter ao menos um número" }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
