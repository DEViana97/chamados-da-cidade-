import type { Occurrence, User, Comment, StatusHistory, Category, Status, Role } from "@/generated/prisma/client"

export type { Category, Status, Role }

export type OccurrenceWithRelations = Occurrence & {
  assignedTo: User | null
  comments: (Comment & { author: Pick<User, "id" | "name" | "image"> })[]
  history: StatusHistory[]
  _count?: { comments: number }
}

export type OccurrenceListItem = Occurrence & {
  assignedTo: Pick<User, "id" | "name" | "image"> | null
  _count: { comments: number }
}

export type DashboardMetrics = {
  totalOpen: number
  resolvedThisMonth: number
  avgResolutionDays: number
  criticalPending: number
}

export type ChartDataPoint = {
  date: string
  count: number
}

export type CategoryBreakdown = {
  category: string
  count: number
}

export type StatusBreakdown = {
  status: string
  count: number
}

export type OccurrenceFilters = {
  search?: string
  category?: Category
  status?: Status
  from?: string
  to?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
