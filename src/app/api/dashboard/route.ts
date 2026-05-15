import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [totalOpen, resolvedThisMonth, criticalPending, resolvedWithHistory, dailyCounts, categoryBreakdown, statusBreakdown] =
    await Promise.all([
      prisma.occurrence.count({ where: { status: "OPEN" } }),
      prisma.occurrence.count({ where: { status: "RESOLVED", updatedAt: { gte: startOfMonth } } }),
      prisma.occurrence.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] }, category: "POTHOLE" } }),
      prisma.statusHistory.findMany({
        where: { to: "RESOLVED", changedAt: { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } },
        include: { occurrence: { select: { createdAt: true } } },
      }),
      prisma.occurrence.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
      prisma.occurrence.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
      prisma.occurrence.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ])

  const avgResolutionDays =
    resolvedWithHistory.length > 0
      ? resolvedWithHistory.reduce((acc, h) => {
          const diff = h.changedAt.getTime() - h.occurrence.createdAt.getTime()
          return acc + diff / (1000 * 60 * 60 * 24)
        }, 0) / resolvedWithHistory.length
      : 0

  const dailyMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dailyMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const row of dailyCounts) {
    const key = row.createdAt.toISOString().slice(0, 10)
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + row._count.id)
  }
  const dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    metrics: {
      totalOpen,
      resolvedThisMonth,
      avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
      criticalPending,
    },
    charts: {
      daily: dailyData,
      byCategory: categoryBreakdown.map((r) => ({ category: r.category, count: r._count.id })),
      byStatus: statusBreakdown.map((r) => ({ status: r.status, count: r._count.id })),
    },
  })
}
