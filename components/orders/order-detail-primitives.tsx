"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function genderLabelAr(g: string | null | undefined): string {
  if (!g?.trim()) return "—"
  const v = g.trim().toLowerCase()
  if (v === "male" || v === "m" || v === "ذكر") return "ذكر"
  if (v === "female" || v === "f" || v === "أنثى" || v === "انثى") return "أنثى"
  return g
}

export function StatBlock({
  icon: Icon,
  label,
  value,
  accent,
  valueClassName,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  accent?: "primary" | "success" | "warning" | "info"
  valueClassName?: string
}) {
  const accentClass =
    accent === "success"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : accent === "warning"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : accent === "info"
          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : "bg-primary/10 text-primary"
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-3 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            accentClass
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
          <div className={valueClassName ?? "truncate text-sm font-semibold leading-tight"}>{value}</div>
        </div>
      </div>
    </div>
  )
}

export function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <h4 className="text-sm font-semibold leading-tight">{title}</h4>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  )
}
