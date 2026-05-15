import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateUserSchema = z.object({
  id: z.string().cuid(),
  role: z.enum(["ADMIN", "ANALYST"]).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body: unknown = await request.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const user = await prisma.user.update({
    where: { id: parsed.data.id },
    data: { ...(parsed.data.role && { role: parsed.data.role }) },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(user)
}
