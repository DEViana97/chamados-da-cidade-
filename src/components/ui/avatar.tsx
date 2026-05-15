import { cn } from "@/lib/utils"

interface AvatarProps {
  name?: string | null
  image?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizes = { sm: "h-6 w-6 text-xs", md: "h-8 w-8 text-sm", lg: "h-10 w-10 text-base" }

export function Avatar({ name, image, size = "md", className }: AvatarProps) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?"

  return (
    <div className={cn("rounded-full overflow-hidden flex items-center justify-center bg-accent/20 text-accent font-medium flex-shrink-0", sizes[size], className)}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name ?? ""} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
