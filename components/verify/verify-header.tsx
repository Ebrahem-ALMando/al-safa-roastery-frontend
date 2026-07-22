'use client'

import * as React from 'react'
import Link from 'next/link'
import { Moon, Printer, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { BrandLogo } from '@/components/branding/BrandLogo'
import { Button } from '@/components/ui/button'
import { BRAND_NAME_AR, BRAND_NAME_EN } from '@/lib/brand'

const DISPLAY_NAME_AR =
  process.env.NEXT_PUBLIC_BRAND_NAME_AR ?? BRAND_NAME_AR

const DISPLAY_NAME_EN =
  process.env.NEXT_PUBLIC_BRAND_NAME_EN ?? BRAND_NAME_EN

export function VerifyHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const onPrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary bg-primary print:static print:border-border print:bg-background">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 text-white print:text-foreground"
        >
          <BrandLogo variant="sidebar" className="border-white/30 print:border-border" priority />
          <div className="min-w-0 text-right leading-tight">
            <p className="truncate text-sm font-bold tracking-tight sm:text-[15px]">
              {DISPLAY_NAME_AR}
            </p>
            <p className="truncate text-[10px] font-medium tracking-widest text-white/85 print:text-muted-foreground">
              {DISPLAY_NAME_EN.toUpperCase()}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-white/75 print:text-muted-foreground">
              بوابة التحقق الرسمية
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1 print:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPrint}
            className="size-9 rounded-md border border-white/20 text-white hover:bg-white/10 print:border-border print:text-foreground print:hover:bg-muted"
            aria-label="طباعة"
          >
            <Printer className="size-4" />
          </Button>
          {mounted && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="size-9 rounded-md border border-white/20 text-white hover:bg-white/10 print:border-border print:text-foreground print:hover:bg-muted"
              aria-label="تبديل الوضع الفاتح والداكن"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
