"use client"

import { useCallback, useEffect, useState } from "react"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { usersApi, ApiError, type UserDto } from "@/lib/api"
import { PageHeader } from "@/components/dashboard/page-header"
import { RoleBadge } from "@/components/auth/role-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, RefreshCw, ChevronLeft, ChevronRight, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import type { Role } from "@/lib/auth"

const PAGE_SIZE = 10
const ROLES: Role[] = ["USER", "LIBRARIAN", "ADMIN"]

function safeDate(iso?: string | null) {
  if (!iso) return "—"
  try {
    return format(parseISO(iso), "dd MMM yyyy")
  } catch {
    return iso
  }
}

export default function MembersPage() {
  const { isLoading: authLoading } = useProtectedRoute({ allowedRoles: ["ADMIN"] })
  const { user } = useAuth()

  const [members, setMembers] = useState<UserDto[]>([])
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  // Stable fetch — takes explicit args so it has no changing deps.
  const fetchMembers = useCallback(async (p: number, q: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await usersApi.getAll(q, p, PAGE_SIZE)
      const data = res.data
      setMembers(data?.content ?? [])
      setTotalPages(Math.max(1, data?.totalPages ?? 1))
      setTotalElements(data?.totalElements ?? 0)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return // api layer redirects
      const msg = err instanceof ApiError ? err.message : String(err)
      setError(msg)
      toast.error("Failed to load members", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  // A new search term resets to the first page.
  useEffect(() => {
    setPage(0)
  }, [debouncedQuery])

  // Single source of truth for fetching: page or search term changes.
  useEffect(() => {
    if (authLoading) return
    fetchMembers(page, debouncedQuery)
  }, [authLoading, page, debouncedQuery, fetchMembers])

  const handleRoleChange = async (member: UserDto, role: string) => {
    if (role === member.role) return
    setBusyId(member.id)
    try {
      await usersApi.updateRole(member.id, role)
      toast.success(`Role updated`, { description: `${member.name} is now ${role}` })
      await fetchMembers(page, debouncedQuery)
    } catch (err) {
      toast.error("Couldn't update role", {
        description: err instanceof ApiError ? err.message : String(err),
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleActive = async (member: UserDto) => {
    setBusyId(member.id)
    try {
      if (member.active) await usersApi.deactivate(member.id)
      else await usersApi.activate(member.id)
      toast.success(member.active ? "Member deactivated" : "Member activated", {
        description: member.name,
      })
      await fetchMembers(page, debouncedQuery)
    } catch (err) {
      toast.error("Couldn't update status", {
        description: err instanceof ApiError ? err.message : String(err),
      })
    } finally {
      setBusyId(null)
    }
  }

  if (authLoading) return null

  return (
    <div className="space-y-6">
      <PageHeader title="Members" description="Manage members, roles, and access">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border"
          onClick={() => fetchMembers(page, debouncedQuery)}
          disabled={loading}
          aria-label="Refresh members"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or member ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Member ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Loans</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  {error ? "Couldn't load members." : "No members found."}
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isSelf = member.id === user?.id
                const rowBusy = busyId === member.id
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{member.name}</p>
                          {isSelf && <span className="text-[10px] text-muted-foreground">(you)</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{member.memberId ?? "—"}</TableCell>
                    <TableCell>
                      {isSelf ? (
                        <RoleBadge role={member.role as Role} size="sm" />
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(v) => handleRoleChange(member, v)}
                          disabled={rowBusy}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.active ? (
                        <span className="text-xs font-medium text-emerald-500">Active</span>
                      ) : (
                        <span className="text-xs font-medium text-destructive">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{member.activeLoans}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{safeDate(member.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={member.active
                          ? "text-destructive hover:text-destructive"
                          : "text-emerald-500 hover:text-emerald-500"}
                        disabled={isSelf || rowBusy}
                        onClick={() => handleToggleActive(member)}
                      >
                        {member.active ? (
                          <>
                            <UserX className="mr-1.5 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-1.5 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {totalElements} member{totalElements !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
