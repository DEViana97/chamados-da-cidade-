import { cn } from "@/lib/utils"

type BadgeVariant = "open" | "in_progress" | "resolved" | "pothole" | "garbage" | "lighting" | "other" | "admin" | "analyst" | "default"

const variants: Record<BadgeVariant, string> = {
  open: "bg-danger/15 text-danger border border-danger/30",
  in_progress: "bg-warning/15 text-warning border border-warning/30",
  resolved: "bg-success/15 text-success border border-success/30",
  pothole: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  garbage: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  lighting: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  other: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  admin: "bg-accent/15 text-accent border border-accent/30",
  analyst: "bg-surface-2 text-muted border border-border",
  default: "bg-surface-2 text-muted border border-border",
}

const statusMap: Record<string, BadgeVariant> = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
}

const categoryMap: Record<string, BadgeVariant> = {
  POTHOLE: "pothole",
  GARBAGE: "garbage",
  LIGHTING: "lighting",
  OTHER: "other",
}

const roleMap: Record<string, BadgeVariant> = {
  ADMIN: "admin",
  ANALYST: "analyst",
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  status?: string
  category?: string
  role?: string
  className?: string
}

export function Badge({ children, variant, status, category, role, className }: BadgeProps) {
  const resolvedVariant =
    variant ??
    (status ? statusMap[status] : undefined) ??
    (category ? categoryMap[category] : undefined) ??
    (role ? roleMap[role] : undefined) ??
    "default"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        variants[resolvedVariant],
        className,
      )}
    >
      {children}
    </span>
  )
}
