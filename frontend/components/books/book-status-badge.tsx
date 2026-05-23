import { cn } from "@/lib/utils"

interface BookStatusBadgeProps {
  available: boolean
  size?: "sm" | "md"
}

export function BookStatusBadge({ available, size = "md" }: BookStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        available
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/15"
          : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/15"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          available ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      {available ? "Available" : "Issued"}
    </span>
  )
}
