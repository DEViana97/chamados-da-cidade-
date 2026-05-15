"use client"

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { categoryLabels, statusLabels } from "@/lib/utils"

const COLORS = {
  area: "#2563eb",
  POTHOLE: "#f97316",
  GARBAGE: "#eab308",
  LIGHTING: "#3b82f6",
  OTHER: "#a855f7",
  OPEN: "#dc2626",
  IN_PROGRESS: "#d97706",
  RESOLVED: "#16a34a",
}

const tooltipStyle = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: "6px",
  color: "#e8e8e8",
  fontSize: "12px",
}

interface ChartsProps {
  daily: { date: string; count: number }[]
  byCategory: { category: string; count: number }[]
  byStatus: { status: string; count: number }[]
}

export function DashboardCharts({ daily, byCategory, byStatus }: ChartsProps) {
  const dailyFormatted = daily.map((d) => ({
    ...d,
    label: new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  }))

  const categoryFormatted = byCategory.map((d) => ({
    ...d,
    name: categoryLabels[d.category] ?? d.category,
  }))

  const statusFormatted = byStatus.map((d) => ({
    ...d,
    name: statusLabels[d.status] ?? d.status,
    fill: COLORS[d.status as keyof typeof COLORS] ?? "#888",
  }))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Area chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ocorrências — últimos 30 dias</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyFormatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.area} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.area} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
            <YAxis tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="count" stroke={COLORS.area} fill="url(#areaGrad)" strokeWidth={2} name="Ocorrências" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie chart */}
      <Card>
        <CardHeader>
          <CardTitle>Por status</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={statusFormatted} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} strokeWidth={0}>
              {statusFormatted.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: "#888", fontSize: 11 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Por categoria</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={categoryFormatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={32}>
            <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#888", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            {categoryFormatted.map((d, i) => (
              <Bar key={i} dataKey="count" name={d.name} fill={COLORS[d.category as keyof typeof COLORS] ?? "#888"} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
