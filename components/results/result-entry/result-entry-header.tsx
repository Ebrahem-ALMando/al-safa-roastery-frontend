"use client"

import Link from "next/link"
import { ArrowRight, Loader2, Save, SaveAll } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { LabOrder } from "@/features/orders"
import { getResultsProgressStatus, resultsProgressLabels } from "@/components/results/results-helpers"

type ResultEntryHeaderProps = {
  order: LabOrder | null
  isLoading: boolean
  saving: boolean
  savingDraft: boolean
  disabled: boolean
  onSaveAll: () => Promise<void>
  onSaveDraft: () => Promise<void>
}

export function ResultEntryHeader({
  order,
  isLoading,
  saving,
  savingDraft,
  disabled,
  onSaveAll,
  onSaveDraft,
}: ResultEntryHeaderProps) {
  const prog = order ? getResultsProgressStatus(order) : "pending"
  const progCfg = resultsProgressLabels[prog]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <Link href="/dashboard/results">
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 rounded-xl" aria-label="العودة لقائمة النتائج">
            <ArrowRight className="size-5" />
          </Button>
        </Link>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">إدخال النتائج</h1>
            {order ? (
              <Badge variant="outline" className={`rounded-lg text-xs font-medium ${progCfg.badgeClass}`}>
                {progCfg.label}
              </Badge>
            ) : null}
          </div>
          {order ? (
            <p className="text-sm text-muted-foreground">
              طلب رقم{" "}
              <span className="font-mono font-semibold text-foreground" dir="ltr">
                {order.order_number}
              </span>
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">جاري تحميل الطلب…</p>
          ) : (
            <p className="text-sm text-destructive">تعذر تحميل الطلب</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-2 rounded-xl"
          disabled={!order || disabled || saving || savingDraft || isLoading}
          onClick={() => void onSaveDraft()}
        >
          {savingDraft ? <Loader2 className="size-4 animate-spin" /> : <SaveAll className="size-4" />}
          حفظ المسودة
        </Button>
        <Button
          type="button"
          className="gap-2 rounded-xl"
          disabled={!order || disabled || saving || savingDraft || isLoading}
          onClick={() => void onSaveAll()}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          حفظ جميع النتائج
        </Button>
      </div>
    </div>
  )
}
