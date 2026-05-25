import { Skeleton } from "@/components/ui/skeleton"

/**
 * Next.js App Router loading UI for /dashboard/issue.
 */
export default function IssueLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      {/* Form card */}
      <div className="max-w-2xl space-y-5">
        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-muted/20">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          {/* Form fields */}
          <div className="px-6 py-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border/50" />
              <Skeleton className="h-3 w-16" />
              <div className="flex-1 border-t border-border/50" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 h-40" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
