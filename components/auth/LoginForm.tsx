"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react"
import { useAuthActions } from "@/features/auth"
import { mapApiError } from "@/lib/errors/mapApiError"
import { safeRedirectPath } from "@/lib/auth/redirect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ApiRequestError } from "@/lib/api"
import { FORM_MSG } from "@/lib/messages/form"

type LoginFormProps = {
  /** Internal path after success (e.g. /dashboard/orders) */
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter()
  const { login } = useAuthActions()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password) {
      setError(FORM_MSG.USERNAME_PASSWORD_REQUIRED)
      return
    }
    setIsSubmitting(true)
    try {
      await login({ username, password })
      const target = safeRedirectPath(redirectTo)
      router.replace(target)
      router.refresh()
    } catch (err) {
      setError(mapApiError(err))
      if (err instanceof ApiRequestError) {
        // ensure developer sees original in console during debugging
        if (process.env.NODE_ENV === "development") {
          console.warn("[auth]", err.status, err.message)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
      noValidate
      autoComplete="on"
    >
      <div className="space-y-2">
        <Label htmlFor="username" className="text-foreground/90">
          اسم المستخدم
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="أدخل اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            className="h-11 pr-10 transition-all duration-200 focus-visible:ring-2"
            dir="rtl"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground/90">
          كلمة المرور
        </Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="h-11 pl-10 pr-10 transition-all duration-200 focus-visible:ring-2"
            dir="rtl"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
            tabIndex={-1}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div
        id="login-error"
        role="alert"
        className={cn(
          "overflow-hidden rounded-lg border text-sm transition-all duration-300 ease-out",
          error
            ? "max-h-40 border-destructive/30 bg-destructive/5 px-3 py-2.5 text-destructive"
            : "max-h-0 border-transparent py-0 opacity-0"
        )}
        aria-live="assertive"
      >
        {error}
      </div>

      <Button
        type="submit"
        className="h-11 w-full min-h-11 text-base font-semibold shadow-md transition-all duration-200 ease-out hover:shadow-lg active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 disabled:active:scale-100"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="size-4 shrink-0 animate-spin"
              aria-hidden
            />
            جارٍ تسجيل الدخول…
          </>
        ) : (
          "تسجيل الدخول"
        )}
      </Button>
    </form>
  )
}
