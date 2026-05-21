import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const unreadOnly = searchParams.get("unread") === "true"

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(notifications)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json() as { markAllRead?: boolean }
  if (!body.markAllRead) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  return NextResponse.json({ ok: true })
}
