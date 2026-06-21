"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

/**
 * Theme switch — uses `next-themes` (attribute="class" on <html>),
 * which applies `dark` the same as `document.documentElement.classList.toggle("dark")`
 * and persists to localStorage.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className="pointer-events-none fixed end-4 top-4 z-50 h-10 w-10"
        aria-hidden
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="fixed end-4 top-4 z-50 h-10 w-10 rounded-full border-border/50 bg-card/90 shadow-md backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg active:scale-95"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
    >
      {isDark ? (
        <Sun className="size-[1.1rem] text-amber-500/90" />
      ) : (
        <Moon className="size-[1.1rem] text-primary" />
      )}
    </Button>
  )
}
