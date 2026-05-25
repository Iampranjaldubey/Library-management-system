import { Skeleton } from "@/components/ui/skeleton"
import { BookGridSkeleton } from "@/components/books/book-grid-skeleton"

/**
 * Next.js App Router loading UI for /dashboard/books.
 */
export default function BooksLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-9 w-full max-w-sm rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-lg ml-auto sm:ml-0" />
        </div>
      </div>

      {/* Grid */}
      <BookGridSkeleton count={12} />
    </div>
  )
}
