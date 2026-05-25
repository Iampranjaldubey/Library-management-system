"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StatusFilter } from "@/hooks/use-transactions"

// ─── Status option config ─────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: StatusFilter
  label: string
  dot?: string
  pulse?: boolean
}[] = [
  { value: "all",      label: "All Status" },
  { value: "ACTIVE",   label: "Active",   dot: "bg-primary" },
  { value: "RETURNED", label: "Returned", dot: "bg-emerald-500" },
  { value: "OVERDUE",  label: "Overdue",  dot: "bg-destructive", pulse: true },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusChange: (value: StatusFilter) => void
  resultCount: number
  totalCount: number
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionsFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  resultCount,
  totalCount,
  disabled,
}: TransactionsFiltersProps) {
  const isFiltered = searchQuery.trim() !== "" || statusFilter !== "all"
  const activeFilterCount =
    (searchQuery.trim() !== "" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)

  const handleClear = () => {
    onSearchChange("")
    onStatusChange("all")
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">

        {/* ── Search input ── */}
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search by book or member…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "pl-9 bg-card/60 backdrop-blur-sm",
              "placeholder:text-muted-foreground/40",
              searchQuery && "pr-9"
            )}
          />
          {/* Clear search button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.1 }}
                type="button"
                onClick={() => onSearchChange("")}
                className={cn(
                  "absolute right-2.5 top-1/2 -translate-y-1/2",
                  "flex h-5 w-5 items-center justify-center rounded-md",
                  "text-muted-foreground/60 hover:text-foreground hover:bg-muted",
                  "transition-colors duration-100",
                )}
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2">

          {/* Filter icon with active badge */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <Filter className="h-4 w-4 text-muted-foreground/60" />
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                >
                  {activeFilterCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Status dropdown */}
          <Select
            value={statusFilter}
            onValueChange={(v) => onStatusChange(v as StatusFilter)}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "w-36 bg-card/60 backdrop-blur-sm",
                statusFilter !== "all" && "border-primary/40 ring-1 ring-primary/15"
              )}
            >
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.dot && (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          opt.dot,
                          opt.pulse && "animate-pulse"
                        )}
                      />
                    )}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear all */}
          <AnimatePresence>
            {isFiltered && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-9 px-3 gap-1.5 text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Result summary ── */}
      <AnimatePresence>
        {!disabled && totalCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground/70 tabular-nums"
          >
            Showing{" "}
            <span className="font-semibold text-foreground">{resultCount}</span>
            {" "}of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span>
            {" "}transactions
            {isFiltered && (
              <span className="text-muted-foreground/50"> · filtered</span>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
