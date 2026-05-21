import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateOccurrenceSchema } from "@/lib/validations/occurrence"
import { notifyStatusChanged } from "@/lib/services/notifications"
import type { Status } from "@/generated/prisma/client"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const occurrence = await prisma.occurrence.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, image: true, email: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
      history: { orderBy: { changedAt: "asc" } },
    },
  })

  if (!occurrence) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(occurrence)
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body: unknown = await request.json()
  const parsed = updateOccurrenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const existing = await prisma.occurrence.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { status, ...rest } = parsed.data

  const statusChanged = !!status && status !== existing.status

  const [occurrence] = await prisma.$transaction(async (tx) => {
    if (statusChanged) {
      await tx.statusHistory.create({
        data: {
          occurrenceId: id,
          from: existing.status as Status,
          to: status as Status,
        },
      })
    }
    const updated = await tx.occurrence.update({
      where: { id },
      data: { ...rest, ...(status && { status }) },
    })
    return [updated]
  })

  if (statusChanged) {
    void notifyStatusChanged(occurrence, status!, session.user.id)
  }

  return NextResponse.json(occurrence)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.occurrence.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
