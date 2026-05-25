import { Skeleton } from "@/components/ui/skeleton"

// ─── Stats card skeleton ──────────────────────────────────────────────────────

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

// ─── Table row skeleton ───────────────────────────────────────────────────────

export function TableRowSkeleton({ cols = 7 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}

// ─── Table skeleton ───────────────────────────────────────────────────────────

export function TableSkeleton({
  rows = 5,
  cols = 7,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Form skeleton ────────────────────────────────────────────────────────────

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// ─── Dashboard page skeleton ──────────────────────────────────────────────────

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 animate-in">
      {/* Welcome + refresh button */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      </div>

      {/* Analytics cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent transactions */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full max-w-xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent books table */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <div className="p-6">
              <TableSkeleton rows={5} cols={6} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Activity overview */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
