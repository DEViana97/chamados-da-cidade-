"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json() as { error: string }
        toast.error(typeof err.error === "string" ? err.error : "Erro ao cadastrar")
        return
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push("/dashboard")
      router.refresh()
      toast.success("Conta criada com sucesso!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-text">Criar conta</h2>
        <p className="text-sm text-muted mt-0.5">Preencha os dados abaixo</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("name")}
          label="Nome"
          placeholder="Seu nome completo"
          error={errors.name?.message}
        />
        <Input
          {...register("email")}
          label="Email"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
        />
        <Input
          {...register("password")}
          label="Senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
        />
        <Button type="submit" loading={loading} className="w-full">
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
