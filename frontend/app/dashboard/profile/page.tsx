"use client"

import { useEffect, useState } from "react"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { usersApi, ApiError, type UserDto } from "@/lib/api"
import { RoleBadge } from "@/components/auth/role-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Mail, Hash, CalendarDays, BookMarked, CheckCircle2, XCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import type { Role } from "@/lib/auth"

function initials(name?: string) {
  return name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "LO"
}

function safeDate(iso?: string | null) {
  if (!iso) return "—"
  try {
    return format(parseISO(iso), "dd MMM yyyy")
  } catch {
    return iso
  }
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { isLoading: authLoading } = useProtectedRoute()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    let active = true
    ;(async () => {
      try {
        const res = await usersApi.getProfile()
        if (active) setProfile(res.data ?? null)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return // api layer handles redirect
        toast.error("Couldn't load your profile", {
          description: err instanceof ApiError ? err.message : String(err),
        })
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [authLoading])

  if (authLoading) return null

  // Prefer the backend profile; fall back to the auth-context user for instant paint.
  const name = profile?.name ?? user?.name ?? "—"
  const email = profile?.email ?? user?.email ?? "—"
  const role = (profile?.role ?? user?.role) as Role | undefined

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Your account details</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Identity header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">{name}</h2>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
              {role && (
                <div className="mt-2">
                  <RoleBadge role={role} size="sm" showIcon />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Details */}
          {loading && !profile ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailRow
                icon={Hash}
                label="Member ID"
                value={<span className="font-mono">{profile?.memberId ?? "—"}</span>}
              />
              <DetailRow icon={Mail} label="Email" value={email} />
              <DetailRow icon={CalendarDays} label="Member since" value={safeDate(profile?.createdAt)} />
              <DetailRow icon={BookMarked} label="Active loans" value={profile?.activeLoans ?? 0} />
              <DetailRow
                icon={profile?.active === false ? XCircle : CheckCircle2}
                label="Status"
                value={
                  profile?.active === false ? (
                    <span className="text-destructive">Inactive</span>
                  ) : (
                    <span className="text-emerald-500">Active</span>
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
