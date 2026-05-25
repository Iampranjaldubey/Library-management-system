"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { ProtectedComponent } from "@/components/auth/protected-component"
import { Button } from "@/components/ui/button"
import { BookPlus, RotateCcw, BookOpen, ArrowLeftRight } from "lucide-react"
import Link from "next/link"
import { staggerContainer, staggerItem, cardHover, cardTap } from "@/lib/animations"

export function QuickActions() {
  const { user } = useAuth()

  const actions = [
    {
      label: "Browse Books",
      description: "View catalogue",
      icon: BookOpen,
      href: "/dashboard/books",
      permission: null,
    },
    {
      label: "Issue Book",
      description: "Lend to member",
      icon: BookPlus,
      href: "/dashboard/issue",
      permission: "transactions:issue" as const,
    },
    {
      label: "Return Book",
      description: "Process return",
      icon: RotateCcw,
      href: "/dashboard/return",
      permission: "transactions:return" as const,
    },
    {
      label: "Transactions",
      description: "View history",
      icon: ArrowLeftRight,
      href: "/dashboard/transactions",
      permission: "transactions:view-all" as const,
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Common tasks and shortcuts</p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          {actions.map((action) => {
            const tile = (
              <motion.div
                key={action.label}
                variants={staggerItem}
                whileHover={cardHover}
                whileTap={cardTap}
              >
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-auto p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 hover:bg-primary/5 hover:border-primary/30 transition-colors group"
                >
                  <Link href={action.href}>
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-foreground leading-tight">{action.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">{action.description}</p>
                    </div>
                  </Link>
                </Button>
              </motion.div>
            )

            if (action.permission) {
              return (
                <ProtectedComponent key={action.label} permission={action.permission}>
                  {tile}
                </ProtectedComponent>
              )
            }
            return tile
          })}
        </motion.div>
      </div>
    </div>
  )
}
