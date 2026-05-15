import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addCommentSchema } from "@/lib/validations/occurrence"

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

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      authorId: session.user.id,
      occurrenceId: id,
    },
    include: { author: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}
