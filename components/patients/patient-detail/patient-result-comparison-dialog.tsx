"use client"

import { motion } from "framer-motion"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  GitCompareArrows,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatArDateTime } from "@/components/orders/orders-helpers"
import type { ComparisonEntry } from "./patient-detail-data"
import {
  computeTrendDirection,
  ORDER_RESULT_THEMES,
} from "./patient-detail-data"
import { PatientResultTrendChart } from "./patient-result-trend-chart"
import { ResultFlagBadge } from "./result-flag-badge"

type PatientResultComparisonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  testName: string
  fieldName: string
  entries: ComparisonEntry[]
}

function TrendBadge({
  direction,
  deltaPct,
}: {
  direction: ReturnType<typeof computeTrendDirection>
  deltaPct: number | null
}) {
  if (direction === "unknown") {
    return (
      <Badge
        variant="outline"
        className="gap-1 rounded-full px-2 py-0.5 text-[11px] text-muted-foreground"
      >
        <Minus className="size-3" />
        —
      </Badge>
    )
  }
  if (direction === "stable") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-slate-500/10 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
      >
        <ArrowRight className="size-3" />
        ثابت
      </motion.div>
    )
  }
  const up = direction === "up"
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
        up
          ? "border-rose-300/70 bg-linear-to-bl from-rose-500/15 to-rose-500/5 text-rose-800 dark:text-rose-100"
          : "border-sky-300/70 bg-linear-to-bl from-sky-500/15 to-sky-500/5 text-sky-900 dark:text-sky-100"
      )}
    >
      <span
        className={cn(
          "grid size-4 place-items-center rounded-full",
          up ? "bg-rose-500/15" : "bg-sky-500/15"
        )}
      >
        {up ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
      </span>
      <span>{up ? "ارتفاع" : "انخفاض"}</span>
      {deltaPct != null ? (
        <span className="font-mono tabular-nums" dir="ltr">
          {up ? "+" : ""}
          {deltaPct.toFixed(1)}%
        </span>
      ) : null}
    </motion.div>
  )
}

function InlineTrendIcon({ direction }: { direction: ReturnType<typeof computeTrendDirection> }) {
  if (direction === "up") {
    return (
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300">
        <ArrowUpRight className="size-2.5" />
      </span>
    )
  }
  if (direction === "down") {
    return (
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
        <ArrowDownRight className="size-2.5" />
      </span>
    )
  }
  if (direction === "stable") {
    return (
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-slate-500/15 text-muted-foreground">
        <Minus className="size-2.5" />
      </span>
    )
  }
  return null
}

export function PatientResultComparisonDialog({
  open,
  onOpenChange,
  testName,
  fieldName,
  entries,
}: PatientResultComparisonDialogProps) {
  const theme = ORDER_RESULT_THEMES[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="flex min-h-0 max-h-[94vh] w-[min(100vw-1rem,980px)] max-w-[min(100vw-1rem,980px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:max-w-[min(100vw-1.25rem,980px)]"
        showCloseButton
      >
        <DialogHeader className="relative shrink-0 space-y-0 overflow-hidden border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
          <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <motion.div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative shrink-0">
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-xl" />
                <div className="flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-md sm:size-20">
                  <GitCompareArrows className="size-8 sm:size-10" strokeWidth={1.5} />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <DialogTitle className="text-xl font-bold leading-tight sm:text-2xl">
                  مقارنة النتائج عبر الطلبات
                </DialogTitle>
                <DialogDescription className="text-sm">
                  تتبّع تغيّر نفس البند عبر الطلبات المعروضة في الصفحة الحالية، مع رسم الاتجاه وجدول
                  المقارنة.
                </DialogDescription>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <Badge variant="secondary" className="gap-1 rounded-lg text-[11px] font-semibold">
                    {fieldName}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-[11px]">
                    {testName}
                  </Badge>
                  <Badge variant="outline" className="gap-1 rounded-lg text-[11px]">
                    {entries.length} طلب في المقارنة
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
          <div className="space-y-4 p-4 pb-8 sm:p-6 sm:pb-10">
              <PatientResultTrendChart entries={entries} />

              <div className="overflow-x-auto rounded-xl border border-border/60">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-right font-semibold">الطلب</TableHead>
                      <TableHead className="text-right font-semibold">التاريخ</TableHead>
                      <TableHead className="text-center font-semibold">القيمة</TableHead>
                      <TableHead className="text-center font-semibold">التصنيف</TableHead>
                      <TableHead className="text-center font-semibold">التغيّر</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => {
                      const dt = entry.orderedAt
                        ? formatArDateTime(entry.orderedAt)
                        : { date: "—", time: "" }
                      const prev = index > 0 ? entries[index - 1]! : null
                      const trend = computeTrendDirection(entry.numeric, prev?.numeric ?? null)
                      let deltaPct: number | null = null
                      if (
                        entry.numeric !== null &&
                        prev != null &&
                        prev.numeric !== null &&
                        prev.numeric !== 0 &&
                        trend !== "unknown" &&
                        trend !== "stable"
                      ) {
                        deltaPct = ((entry.numeric - prev.numeric) / Math.abs(prev.numeric)) * 100
                      }

                      return (
                        <TableRow
                          key={entry.orderId}
                          className={cn(index % 2 === 0 && theme.bg)}
                        >
                          <TableCell className="text-right">
                            <p className="font-mono text-xs font-bold text-primary" dir="ltr">
                              {entry.orderNumber}
                            </p>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            <p>{dt.date}</p>
                            {dt.time ? <p dir="ltr">{dt.time}</p> : null}
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm font-semibold" dir="ltr">
                            {[entry.value, entry.unit?.trim()].filter(Boolean).join(" ") || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <ResultFlagBadge flag={entry.flag} size="md" />
                          </TableCell>
                          <TableCell className="text-center">
                            {index === 0 ? (
                              <span className="text-xs text-muted-foreground">أساس</span>
                            ) : (
                              <TrendBadge direction={trend} deltaPct={deltaPct} />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { InlineTrendIcon, TrendBadge }
