import { DashboardPageSkeleton } from "@/components/dashboard/skeletons"

/**
 * Next.js App Router loading UI for the /dashboard route segment.
 * Shown automatically during server-side navigation and initial load.
 */
export default function DashboardLoading() {
  return <DashboardPageSkeleton />
}
