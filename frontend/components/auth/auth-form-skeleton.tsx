import { Skeleton } from "@/components/ui/skeleton"

// ─── Login form skeleton ──────────────────────────────────────────────────────

export function LoginFormSkeleton() {
  return (
    <div className="space-y-7" aria-hidden="true">
      {/* Heading */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Remember me + forgot */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full rounded-md mt-2" />
      </div>

      {/* Footer link */}
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>
  )
}

// ─── Register form skeleton ───────────────────────────────────────────────────

export function RegisterFormSkeleton() {
  return (
    <div className="space-y-7" aria-hidden="true">
      {/* Heading */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Name, Email, Password, Confirm */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}

        {/* Role selector */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="h-10 w-full rounded-md mt-2" />
      </div>

      {/* Footer link */}
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>
  )
}
