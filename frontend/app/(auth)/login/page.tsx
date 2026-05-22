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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
  if (authLoading) return null

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
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Server-level error banner */}
        {serverError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@library.com"
            autoComplete="email"
            autoFocus
            className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50"
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary"
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

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
