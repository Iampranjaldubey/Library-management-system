"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService, AuthError } from "@/lib/auth"
import { useAuth } from "@/context/auth-context"
import { FormField } from "@/components/auth/form-field"
import { PasswordInput } from "@/components/auth/password-input"
import { LoginFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { LoadingButton } from "@/components/ui/button-loader"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

// ─── Validation schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

  // Graceful session-expiry notice: the API layer redirects here with ?expired=1
  // when a silent refresh fails. Read it from the URL directly to avoid the
  // useSearchParams Suspense requirement (keeps this page statically rendered).
  useEffect(() => {
    if (typeof window === "undefined") return
    if (new URLSearchParams(window.location.search).get("expired") === "1") {
      setServerError("Your session expired. Please sign in again.")
      toast.info("Session expired", { description: "Please sign in again to continue." })
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    try {
      const user = await authService.login(data)
      login(user)
      toast.success("Welcome back!", {
        description: `Signed in as ${user.name}`,
      })
      router.replace("/dashboard")
    } catch (err) {
      if (err instanceof AuthError) {
        setServerError(err.message)
        if (err.status === 401) {
          toast.error("Invalid credentials", {
            description: "Check your email and password and try again.",
          })
        }
      } else {
        setServerError("Something went wrong. Please try again.")
        toast.error("Login failed")
      }
    }
  }

  // Don't flash the form while checking stored session
  if (authLoading) return <LoginFormSkeleton />

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server-level error banner */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-snug">{serverError}</p>
          </motion.div>
        )}

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@library.com"
            autoComplete="email"
            autoFocus
            aria-invalid={!!errors.email}
            className="bg-white/5 border-white/10 placeholder:text-muted-foreground/40 focus-visible:border-primary/50 focus-visible:ring-primary/15"
            {...register("email")}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary cursor-pointer"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-150">
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary/80 hover:text-primary transition-colors duration-150"
          >
            Forgot password?
          </Link>
        </div>

        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="Signing in…"
          showProgress
          className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Sign in
        </LoadingButton>
      </form>

      {/* Divider */}
      <div className="relative pt-2 pb-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
        className="w-full flex items-center justify-center gap-3 h-10 rounded-md border border-input bg-background px-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
        Continue with Google
      </button>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
