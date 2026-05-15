import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-4", className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn("text-sm font-medium text-muted uppercase tracking-wide", className)}>{children}</h3>
}
