"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReferenceDisplayParts } from "./orders-helpers"

const tajawalBadgeClass = "font-[family-name:var(--font-tajawal)] font-medium"
const tajawalTextClass =
  "font-[family-name:var(--font-tajawal)] text-xs leading-relaxed tracking-normal text-foreground"

function isLikelyNumericReferenceDisplay(range: string): boolean {
  const t = range.trim()
  if (!t || t === "—") return false
  if (/[\u0600-\u06FF]/.test(t)) return false
  return /^[\d.<>=≤≥–\-]/.test(t) || /^\d/.test(t)
}

export function ReferenceRangeCell({ parts }: { parts: ReferenceDisplayParts }) {
  if (parts.range === "—") {
    return <span className="text-muted-foreground">—</span>
  }

  const numericLike = isLikelyNumericReferenceDisplay(parts.range)

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-0.5">
      <span
        className={cn(
          "max-w-[220px] text-xs leading-relaxed",
          numericLike ? "font-mono tabular-nums text-foreground" : tajawalTextClass
        )}
        dir={numericLike ? "ltr" : "rtl"}
        title={parts.range}
      >
        {parts.range}
      </span>
      {parts.demographicLabel ? (
        <Badge
          variant="secondary"
          className={cn(
            "rounded-full border border-sky-200/80 bg-sky-50/90 px-2.5 py-0.5 text-[10px] text-sky-900 shadow-sm dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-100",
            tajawalBadgeClass
          )}
        >
          {parts.demographicLabel}
        </Badge>
      ) : null}
    </div>
  )
}
