import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  const body: unknown = await request.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, email: true, name: true, role: true },
  })

  return NextResponse.json(user, { status: 201 })
}
