import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@/generated/prisma/client"

const ALL_TYPES: NotificationType[] = ["OCCURRENCE_CREATED", "STATUS_CHANGED", "COMMENT_ADDED"]

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.notificationPreference.findMany({
    where: { userId: session.user.id },
  })

  const existingTypes = new Set(existing.map((p) => p.type))
  const missing = ALL_TYPES.filter((t) => !existingTypes.has(t))

  if (missing.length > 0) {
    await prisma.notificationPreference.createMany({
      data: missing.map((type) => ({ userId: session.user.id, type, enabled: true })),
    })
    return NextResponse.json(
      await prisma.notificationPreference.findMany({ where: { userId: session.user.id } }),
    )
  }

  return NextResponse.json(existing)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json() as { type: NotificationType; enabled: boolean }
  if (!ALL_TYPES.includes(body.type) || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const pref = await prisma.notificationPreference.upsert({
    where: { userId_type: { userId: session.user.id, type: body.type } },
    update: { enabled: body.enabled },
    create: { userId: session.user.id, type: body.type, enabled: body.enabled },
  })

  return NextResponse.json(pref)
}
