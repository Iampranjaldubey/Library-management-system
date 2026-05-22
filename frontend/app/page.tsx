import { redirect } from "next/navigation"

/**
 * Root route — redirect to /login.
 * The actual login form lives at app/(auth)/login/page.tsx.
 */
export default function RootPage() {
  redirect("/login")
}
