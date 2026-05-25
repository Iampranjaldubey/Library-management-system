"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface BookPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function BookPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: BookPaginationProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalItems)

  // Build page number list with ellipsis
  const pages: (number | "…")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("…")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push("…")
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
      {/* Count label */}
      <p className="text-xs text-muted-foreground order-2 sm:order-1 tabular-nums">
        Showing{" "}
        <span className="font-semibold text-foreground">{start}–{end}</span>
        {" "}of{" "}
        <span className="font-semibold text-foreground">{totalItems}</span>
        {" "}books
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First page */}
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </PaginationButton>

        {/* Prev */}
        <PaginationButton
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </PaginationButton>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-6 items-center justify-center text-xs text-muted-foreground/50 select-none"
              >
                ···
              </span>
            ) : (
              <motion.button
                key={p}
                whileTap={{ scale: 0.92 }}
                onClick={() => onPageChange(p as number)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2",
                  "text-xs font-medium transition-all duration-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  p === page
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {p}
              </motion.button>
            )
          )}
        </div>

        {/* Next */}
        <PaginationButton
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </PaginationButton>

        {/* Last page */}
        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </PaginationButton>
      </div>
    </div>
  )
}

// ─── Shared nav button ────────────────────────────────────────────────────────

function PaginationButton({
  children,
  disabled,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg",
        "text-muted-foreground transition-all duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        "active:scale-[0.92]",
        disabled
          ? "opacity-35 cursor-not-allowed"
          : "hover:bg-muted hover:text-foreground cursor-pointer"
      )}
      {...props}
    >
      {children}
    </button>
  )
}
