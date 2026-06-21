"use client"

import { Bell } from "lucide-react"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { BarcodeScannerStatusIndicator } from "@/components/barcode/BarcodeScannerStatusIndicator"

export function HeaderLeft() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex items-center justify-end gap-1.5">
      <BarcodeScannerStatusIndicator />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative rounded-lg"
        aria-label="الإشعارات"
      >
        <Bell className="h-4.5 w-4.5" />
        <span className="absolute -left-1 -top-1 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
          3
        </span>
      </Button>
      {mounted ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
        >
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>
      ) : (
        <div className="h-9 w-9" aria-hidden />
      )}
    </div>
  )
}
