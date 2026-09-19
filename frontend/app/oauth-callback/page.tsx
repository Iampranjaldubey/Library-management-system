"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getStorageKey } from "@/lib/config"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get("token")
    const userStr = searchParams.get("user")

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        
        // Save the access token and user info to localStorage
        localStorage.setItem(getStorageKey("TOKEN"), token)
        localStorage.setItem(getStorageKey("USER"), JSON.stringify(user))

        // Update the AuthContext state
        login(user)
        
        toast.success("Successfully logged in with Google")
        router.replace("/dashboard")
      } catch (err) {
        console.error("Failed to parse OAuth user info", err)
        toast.error("Failed to complete Google login")
        router.replace("/login")
      }
    } else {
      toast.error("Invalid OAuth callback parameters")
      router.replace("/login")
    }
  }, [searchParams, router, login])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
