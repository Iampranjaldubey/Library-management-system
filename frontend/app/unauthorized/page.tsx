"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/auth/role-badge"
import { ShieldAlert, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UnauthorizedPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20"
            >
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="space-y-3 text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground"
            >
              Access Denied
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              You don't have permission to access this page. Your current role doesn't include the
              required permissions for this action.
            </motion.p>
          </div>

          {/* User info */}
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Logged in as:</span>
                <span className="text-sm font-semibold text-foreground">{user.name}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <RoleBadge role={user.role} size="sm" showIcon />
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              asChild
              className="flex-1 gap-2"
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </motion.div>

          {/* Help text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-center text-muted-foreground/60"
          >
            If you believe this is an error, please contact your system administrator.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
