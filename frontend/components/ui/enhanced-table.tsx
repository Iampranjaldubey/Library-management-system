"use client"

import { motion } from "framer-motion"
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { components } from "@/lib/design-system"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  align?: "left" | "center" | "right"
  render?: (item: T, index: number) => React.ReactNode
}

interface EnhancedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortField?: string
  sortDirection?: "asc" | "desc"
  onSort?: (field: string) => void
  className?: string
  emptyMessage?: string
  loading?: boolean
  animate?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Enhanced table component with consistent styling, sorting, and animations.
 * Uses the centralized design system for consistent appearance.
 */
export function EnhancedTable<T extends Record<string, any>>({
  data,
  columns,
  sortField,
  sortDirection,
  onSort,
  className,
  emptyMessage = "No data available",
  loading = false,
  animate = true,
}: EnhancedTableProps<T>) {
  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field)
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />
    }
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3" />
  }

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center": return "text-center"
      case "right": return "text-right"
      default: return "text-left"
    }
  }

  if (loading) {
    return <TableSkeleton columns={columns.length} />
  }

  return (
    <div className={cn(components.table.container, className)}>
      <table className="w-full">
        {/* Header */}
        <thead className={components.table.header}>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  components.table.headerCell,
                  getAlignmentClass(column.align),
                  column.sortable && "cursor-pointer hover:bg-muted/40 transition-colors"
                )}
                style={{ width: column.width }}
                onClick={column.sortable ? () => handleSort(String(column.key)) : undefined}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && getSortIcon(String(column.key))}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : animate ? (
            <motion.tr
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {data.map((item, index) => (
                <motion.tr
                  key={index}
                  variants={staggerItem}
                  className={components.table.row}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        components.table.cell,
                        getAlignmentClass(column.align)
                      )}
                    >
                      {column.render 
                        ? column.render(item, index)
                        : String(item[column.key] || "")
                      }
                    </td>
                  ))}
                </motion.tr>
              ))}
            </motion.tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className={components.table.row}>
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      components.table.cell,
                      getAlignmentClass(column.align)
                    )}
                  >
                    {column.render 
                      ? column.render(item, index)
                      : String(item[column.key] || "")
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────

interface TableSkeletonProps {
  columns: number
  rows?: number
}

function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className={components.table.container}>
      <table className="w-full">
        {/* Header skeleton */}
        <thead className={components.table.header}>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className={components.table.headerCell}>
                <div className="h-3 bg-muted rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>

        {/* Body skeleton */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className={components.table.row}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className={components.table.cell}>
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Table Actions ────────────────────────────────────────────────────────────

interface TableActionsProps {
  children: React.ReactNode
  className?: string
}

export function TableActions({ children, className }: TableActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  )
}

// ─── Action Button ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "ghost"
  /** "xs" is treated as "sm" — Button only supports "sm" as the smallest named size */
  size?: "sm" | "xs"
  disabled?: boolean
}

export function ActionButton({
  onClick,
  children,
  variant = "ghost",
  size = "xs",
  disabled = false,
}: ActionButtonProps) {
  // Map "xs" → "sm" since the Button component doesn't have an "xs" variant
  const buttonSize = size === "xs" ? "sm" : size

  return (
    <Button
      variant={variant}
      size={buttonSize}
      onClick={onClick}
      disabled={disabled}
      className="h-7 px-2"
    >
      {children}
    </Button>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string
  variant?: "default" | "success" | "warning" | "destructive"
  className?: string
}

export function StatusBadge({ status, variant = "default", className }: StatusBadgeProps) {
  const variantClasses = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400", 
    destructive: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
      variantClasses[variant],
      className
    )}>
      {status}
    </span>
  )
}

export { TableSkeleton }