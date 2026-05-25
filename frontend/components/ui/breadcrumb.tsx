"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { staggerContainer, staggerItem } from "@/lib/animations"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Enhanced breadcrumb component with smooth animations and hover effects.
 * Provides clear navigation hierarchy with optional home link.
 */
export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: "Home", href: "/dashboard", icon: Home }, ...items]
    : items

  return (
    <motion.nav
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("flex items-center space-x-1 text-sm", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const Icon = item.icon

          return (
            <motion.li
              key={`${item.label}-${index}`}
              variants={staggerItem}
              className="flex items-center space-x-1"
            >
              {/* Separator */}
              {index > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                </motion.div>
              )}

              {/* Breadcrumb item */}
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className="flex items-center gap-1.5"
              >
                {Icon && (
                  <Icon className={cn(
                    "h-3 w-3",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )} />
                )}

                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(
                    "font-medium",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                )}
              </motion.div>
            </motion.li>
          )
        })}
      </ol>
    </motion.nav>
  )
}

// ─── Preset Breadcrumbs ───────────────────────────────────────────────────────

interface PageBreadcrumbProps {
  title: string
  parent?: { label: string; href: string }
  className?: string
}

export function PageBreadcrumb({ title, parent, className }: PageBreadcrumbProps) {
  const items: BreadcrumbItem[] = parent 
    ? [parent, { label: title }]
    : [{ label: title }]

  return <Breadcrumb items={items} className={className} />
}

// ─── Auto Breadcrumb ──────────────────────────────────────────────────────────

import { usePathname } from "next/navigation"
import { navigation } from "@/lib/navigation"

interface AutoBreadcrumbProps {
  className?: string
}

export function AutoBreadcrumb({ className }: AutoBreadcrumbProps) {
  const pathname = usePathname()
  
  // Find current page in navigation
  const currentPage = navigation.find(item => item.href === pathname)
  
  if (!currentPage) {
    return null
  }

  const items: BreadcrumbItem[] = [
    { label: currentPage.name }
  ]

  return <Breadcrumb items={items} className={className} />
}