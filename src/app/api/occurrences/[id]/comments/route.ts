import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addCommentSchema } from "@/lib/validations/occurrence"
import { notifyCommentAdded } from "@/lib/services/notifications"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body: unknown = await request.json()
  const parsed = addCommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const [comment, occurrence] = await Promise.all([
    prisma.comment.create({
      data: {
        content: parsed.data.content,
        authorId: session.user.id,
        occurrenceId: id,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    }),
    prisma.occurrence.findUnique({ where: { id }, select: { id: true, title: true, userId: true } }),
  ])

  if (occurrence) {
    void notifyCommentAdded(comment, occurrence, session.user.name ?? session.user.email ?? "Alguém")
  }

  return NextResponse.json(comment, { status: 201 })
}
