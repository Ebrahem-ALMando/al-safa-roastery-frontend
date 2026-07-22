"use client"

import Link from "next/link"
import { ChevronLeft, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type QuickActionTheme = "cyan" | "indigo" | "amber" | "emerald"

const themeStyles: Record<
  QuickActionTheme,
  { container: string; icon: string; border: string; glow: string }
> = {
  cyan: {
    container: "bg-sky-500/10",
    icon: "text-sky-700 dark:text-sky-300",
    border: "hover:border-sky-500/30 focus-visible:ring-sky-500/30",
    glow: "group-hover:shadow-sky-500/10",
  },
  indigo: {
    container: "bg-indigo-500/10",
    icon: "text-indigo-700 dark:text-indigo-300",
    border: "hover:border-indigo-500/30 focus-visible:ring-indigo-500/30",
    glow: "group-hover:shadow-indigo-500/10",
  },
  amber: {
    container: "bg-amber-500/10",
    icon: "text-amber-700 dark:text-amber-300",
    border: "hover:border-amber-500/30 focus-visible:ring-amber-500/30",
    glow: "group-hover:shadow-amber-500/10",
  },
  emerald: {
    container: "bg-emerald-500/10",
    icon: "text-emerald-700 dark:text-emerald-300",
    border: "hover:border-emerald-500/30 focus-visible:ring-emerald-500/30",
    glow: "group-hover:shadow-emerald-500/10",
  },
}

interface QuickActionCardProps {
  href: string
  title: string
  description: string
  icon: LucideIcon
  theme: QuickActionTheme
}

export function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  theme,
}: QuickActionCardProps) {
  const styles = themeStyles[theme]

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[7.5rem] flex-col justify-between rounded-xl border border-border/70 bg-card p-4 shadow-sm",
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        styles.border,
        styles.glow
      )}
      aria-label={`${title} — ${description}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300",
            "group-hover:scale-105 motion-reduce:group-hover:scale-100",
            styles.container
          )}
        >
          <Icon className={cn("size-5", styles.icon)} aria-hidden />
        </div>
        <ChevronLeft
          className={cn(
            "size-4 shrink-0 text-muted-foreground/50 transition-all duration-300",
            "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0",
            "group-focus-visible:opacity-100 motion-reduce:opacity-100 motion-reduce:translate-x-0"
          )}
          aria-hidden
        />
      </div>

      <div className="mt-3 space-y-1 text-right">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
      </div>
    </Link>
  )
}
