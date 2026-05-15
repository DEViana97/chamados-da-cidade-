import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createOccurrenceSchema, filterSchema } from "@/lib/validations/occurrence"
import type { Prisma } from "@/generated/prisma/client"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const parsed = filterSchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) return NextResponse.json({ error: "Invalid filters" }, { status: 400 })

  const { search, category, status, from, to, page, limit, sortBy, sortOrder } = parsed.data

  const where: Prisma.OccurrenceWhereInput = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && { category }),
    ...(status && { status }),
    ...(from || to
      ? {
          createdAt: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
  }

  const validSortFields = ["createdAt", "updatedAt", "title", "status", "category"]
  const orderField = sortBy && validSortFields.includes(sortBy) ? sortBy : "createdAt"

  const [total, data] = await Promise.all([
    prisma.occurrence.count({ where }),
    prisma.occurrence.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { [orderField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body: unknown = await request.json()
  const parsed = createOccurrenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const occurrence = await prisma.occurrence.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
    },
  })

  return NextResponse.json(occurrence, { status: 201 })
}
