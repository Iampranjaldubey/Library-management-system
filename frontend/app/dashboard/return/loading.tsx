import { Skeleton } from "@/components/ui/skeleton"

/**
 * Next.js App Router loading UI for /dashboard/return.
 */
export default function ReturnLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
        {/* Left */}
        <div className="space-y-5">
          {/* Alert strip */}
          <Skeleton className="h-12 w-full rounded-xl" />

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-muted/20">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="px-6 py-6 space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/10">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right preview */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                  <div className="flex-1 flex justify-between gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
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
