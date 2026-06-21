"use client"

import type { ReactNode } from "react"
import { FlaskConical, Hash, TestTubes } from "lucide-react"
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
import { getPersonInitials } from "@/lib/person-initials"
import type { LabOrder, LabOrderPatient, LabOrderResultFlag } from "@/features/orders"
import { GroupedItemResults } from "@/components/results/result-display/grouped-item-results"
import { shouldGroupOrderItemResults } from "@/features/results/lib/order-item-result-sections"
import { useOrderTestCatalogEnrichment } from "@/features/results/hooks/useOrderTestCatalogEnrichment"
import { effectiveResultFlagForDisplay } from "@/components/results/results-helpers"
import {
  formatOrderItemResultReferenceParts,
  formatResultValue,
  type ReferenceDisplayParts,
  getEntryStatusLabelAr,
  getLabOrderItemStatusLabelAr,
  getResultFlagLabelAr,
  getResultFlagRowClassName,
} from "./orders-helpers"
import { ReferenceRangeCell } from "./reference-range-cell"

type OrderTestsResultsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: LabOrder | null
}

type FlatRow = {
  key: string
  testName: string
  itemStatus: string
  fieldName: string
  valueDisplay: string
  reference: ReferenceDisplayParts
  resultFlag: LabOrderResultFlag | null
  entryStatus: string
}

const thClass =
  "px-2 py-3.5 text-center text-xs font-bold leading-tight text-foreground sm:px-3 sm:text-sm [&:not(:last-child)]:border-e [&:not(:last-child)]:border-slate-200/70 dark:[&:not(:last-child)]:border-border/60"
const tdClass =
  "px-2 py-3 text-center align-middle text-xs transition-colors duration-200 sm:px-3 sm:text-sm [&:not(:last-child)]:border-e [&:not(:last-child)]:border-slate-200/50 dark:[&:not(:last-child)]:border-border/40"

function buildFlatRows(order: LabOrder): FlatRow[] {
  const out: FlatRow[] = []
  const sortedItems = [...order.items].sort((a, b) => a.sort_order - b.sort_order)

  for (const item of sortedItems) {
    const results = item.results ?? []
    if (results.length === 0) {
      out.push({
        key: `item-${item.id}-empty`,
        testName: item.test_name,
        itemStatus: item.status,
        fieldName: "—",
        valueDisplay: "—",
        reference: { range: "—", demographicLabel: null },
        resultFlag: null,
        entryStatus: "not_entered",
      })
      continue
    }

    const sortedResults = [...results].sort((a, b) => a.id - b.id)
    for (const r of sortedResults) {
      const testField = item.test?.fields?.find((f) => f.id === r.test_field_id)
      out.push({
        key: `res-${r.id}`,
        testName: item.test_name,
        itemStatus: item.status,
        fieldName: r.field_name,
        valueDisplay: [formatResultValue(r.value), r.unit?.trim()].filter(Boolean).join(" "),
        reference: formatOrderItemResultReferenceParts(item, r),
        resultFlag: effectiveResultFlagForDisplay(r, testField?.select_options, testField ?? null),
        entryStatus: r.entry_status,
      })
    }
  }
  return out
}

function flagBadgeClass(flag: LabOrderResultFlag | null): string {
  switch (flag) {
    case "normal":
      return "border-emerald-500/40 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200"
    case "low":
      return "border-sky-500/40 bg-sky-500/12 text-sky-900 dark:text-sky-100"
    case "high":
      return "border-amber-500/45 bg-amber-500/12 text-amber-900 dark:text-amber-100"
    case "abnormal":
      return "border-rose-500/40 bg-rose-500/12 text-rose-900 dark:text-rose-100"
    default:
      return "border-border bg-muted/50 text-muted-foreground"
  }
}

const LEGEND_FLAGS: LabOrderResultFlag[] = ["normal", "low", "high", "abnormal"]

/**
 * مجموعات بشكل fieldset أنيق: إطار سماوي خفيف، خلفية شبه بيضاء، عنوان pill يقطع الإطار من الأعلى.
 * ثيم «المريض» يميّز بشريط لوني داخلي خفيف فقط — نفس منطق العنوان والشكل.
 */
function ResultsFieldset({
  variant,
  title,
  children,
  className,
}: {
  variant: "patient" | "guide"
  title: string
  children: ReactNode
  className?: string
}) {
  const panel = cn(
    "group relative m-0 flex min-h-0 min-w-0 flex-col rounded-2xl border border-sky-200/55 bg-linear-to-b from-sky-50/90 to-white/95 pt-1 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-6px_rgba(14,116,179,0.08)] dark:border-sky-800/40 dark:from-sky-950/35 dark:to-card dark:shadow-none",
    variant === "patient" &&
      "before:pointer-events-none before:absolute before:inset-y-4 before:right-0 before:w-[3px] before:rounded-l-full before:bg-primary/35 dark:before:bg-primary/45",
    className
  )

  const legendPill = cn(
    "inline-flex max-w-[min(100%,18rem)] items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm transition-colors",
    "border-sky-200/90 bg-white/95 text-sky-950 dark:border-sky-700/60 dark:bg-slate-900/95 dark:text-sky-50",
    variant === "patient" && "border-primary/25 text-primary dark:border-primary/35 dark:text-primary"
  )

  return (
    <fieldset className={cn(panel, "px-4 pb-3.5 sm:px-5 sm:pb-4")}>
      <legend className="mx-auto -mt-3 mb-1.5 w-max max-w-[calc(100%-1rem)] shrink-0 px-2 text-center leading-none">
        <span className={legendPill}>{title}</span>
      </legend>
      <div className="min-h-0 flex-1 ">{children}</div>
    </fieldset>
  )
}

function PatientFieldPanel({ patient }: { patient: LabOrderPatient }) {
  const name = patient.full_name?.trim() ? patient.full_name : "—"
  const pn = patient.patient_number?.trim() ? patient.patient_number : "—"
  const phone = patient.phone?.trim() ? patient.phone : "—"
  const initials = getPersonInitials(name === "—" ? "" : name)

  return (
    <ResultsFieldset variant="patient" title="بيانات المريض">
      <div className="flex items-start gap-3.5" dir="rtl">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-full border border-sky-200/95 bg-[#e8f4fc] text-[15px] font-semibold tracking-tight text-sky-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ring-2 ring-sky-100/90 dark:border-sky-700/60 dark:bg-sky-950/50 dark:text-sky-100 dark:ring-sky-900/50"
          aria-hidden
        >
          {name === "—" ? "؟" : initials}
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-right">
          <p className="truncate text-base font-bold leading-snug tracking-tight text-foreground">{name}</p>
          <p className="truncate font-mono text-[13px] text-slate-500 tabular-nums dark:text-slate-400" dir="ltr">
            {pn}
          </p>
       
        </div>
      </div>
    </ResultsFieldset>
  )
}

function EmptyPatientFieldPanel() {
  return (
    <ResultsFieldset variant="patient" title="بيانات المريض">
      <p className="py-2 text-center text-sm leading-relaxed text-muted-foreground">
        لا تتوفر بيانات مريض مرتبطة بهذا الطلب.
      </p>
    </ResultsFieldset>
  )
}

function ResultLegendPanel() {
  return (
    <ResultsFieldset variant="guide" title="دليل تصنيف النتائج">
      <div className="flex flex-wrap items-center justify-center gap-2 py-2.5">
        {LEGEND_FLAGS.map((flag) => (
          <Badge
            key={flag}
            variant="outline"
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]",
              flagBadgeClass(flag)
            )}
          >
            {getResultFlagLabelAr(flag)}
          </Badge>
        ))}
        <Badge
          variant="outline"
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]",
            flagBadgeClass(null)
          )}
        >
          بدون تصنيف
        </Badge>
      </div>
    </ResultsFieldset>
  )
}

export function OrderTestsResultsDialog({ open, onOpenChange, order: rawOrder }: OrderTestsResultsDialogProps) {
  const { order } = useOrderTestCatalogEnrichment(rawOrder)
  const flatRows = order ? buildFlatRows(order) : []
  const totalResults = order?.items.reduce((n, it) => n + (it.results?.length ?? 0), 0) ?? 0
  const useGroupedLayout =
    order?.items.some((item) => shouldGroupOrderItemResults(item)) ?? false
  const sortedItems = order ? [...order.items].sort((a, b) => a.sort_order - b.sort_order) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="flex min-h-0 max-h-[94vh] w-[min(100vw-1rem,1050px)] max-w-[min(100vw-1rem,1050px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:max-w-[min(100vw-1.25rem,1050px)]"
        showCloseButton
      >
        <DialogHeader className="relative shrink-0 space-y-0 overflow-hidden border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
          <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative shrink-0">
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-xl" />
                <div className="flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-md sm:size-20">
                  <TestTubes className="size-8 sm:size-10" strokeWidth={1.5} />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <DialogTitle className="text-xl font-bold leading-tight sm:text-2xl">
                  تحاليل ونتائج الطلب
                </DialogTitle>
                <DialogDescription className="text-sm">
                  عرض منسّق لحقول النتائج مع التصنيف وفق أعلام النتيجة في النظام، وبيانات المريض الأساسية.
                </DialogDescription>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {order ? (
                    <>
                      <Badge variant="outline" className="gap-1 rounded-lg font-mono text-[11px]" dir="ltr">
                        <Hash className="size-3" />
                        {order.order_number}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 rounded-lg text-[11px]">
                        <FlaskConical className="size-3" />
                        {order.items.length} فحص
                      </Badge>
                      <Badge variant="outline" className="rounded-lg text-[11px]">
                        {totalResults} نتيجة مسجلة
                      </Badge>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {!order ? (
            <p className="py-10 text-center text-sm text-muted-foreground">لا يوجد طلب محدد.</p>
          ) : (
            <>
              {/* الصف الأول: عمودان (فيلديست) */}
              <div className="shrink-0 border-b border-border/40 bg-muted/10 px-4 py-3 sm:px-6">
                <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2 lg:gap-4">
                  {order.patient ? <PatientFieldPanel patient={order.patient} /> : <EmptyPatientFieldPanel />}
                  <ResultLegendPanel />
                </div>
              </div>

              {/* الصف الثاني: الجدول */}
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
                <div className="p-4 pb-8 sm:p-6 sm:pb-10">
                  {sortedItems.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">لا توجد تحاليل في هذا الطلب.</p>
                  ) : useGroupedLayout ? (
                    <div className="space-y-4">
                      {sortedItems.map((item) => (
                        <div
                          key={item.id}
                          className="overflow-hidden rounded-xl border border-slate-200/90 bg-card p-4 shadow-sm ring-1 ring-black/3 dark:border-border dark:ring-white/5"
                        >
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="rounded-lg text-xs font-semibold">
                              {item.test_name}
                            </Badge>
                            <Badge variant="outline" className="rounded-lg text-[11px]">
                              {getLabOrderItemStatusLabelAr(item.status)}
                            </Badge>
                          </div>
                          <GroupedItemResults item={item} compact />
                        </div>
                      ))}
                    </div>
                  ) : flatRows.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">لا توجد نتائج مسجّلة.</p>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-card shadow-sm ring-1 ring-black/3 dark:border-border dark:ring-white/5">
                      <Table dir="ltr" className="w-full min-w-[820px] border-collapse text-sm">
                        <TableHeader>
                          <TableRow className="border-0 bg-slate-100/95 hover:bg-slate-100/95 dark:bg-muted/55 dark:hover:bg-muted/55">
                            <TableHead className={cn(thClass, "w-[19%] ")}>الفحص</TableHead>
                            <TableHead className={cn(thClass, "w-[14%]")}>مرحلة الفحص</TableHead>
                            <TableHead className={cn(thClass, "w-[12%]")}>الحقل</TableHead>
                            <TableHead className={cn(thClass, "w-[14%]")} dir="ltr">
                              القيمة
                            </TableHead>
                            <TableHead className={cn(thClass, "w-[16%]")}>المعدل المرجعي</TableHead>
                            <TableHead className={cn(thClass, "w-[12%]")}>حالة الإدخال</TableHead>
                            <TableHead className={cn(thClass, "w-[11%]")}>التصنيف</TableHead>
                            <TableHead className={cn(thClass, "w-10  font-mono tabular-nums")}>#</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flatRows.map((row, idx) => (
                            <TableRow
                              key={row.key}
                              className={cn(
                                "group border-0 border-b border-slate-200/70 last:border-b-0 dark:border-border/80",
                                "cursor-default transition-[box-shadow,transform,background-color] duration-200 ease-out",
                                "hover:-translate-y-px hover:shadow-md hover:ring-1 hover:ring-primary/15 dark:hover:ring-primary/25",
                                getResultFlagRowClassName(row.resultFlag)
                              )}
                            >
                              <TableCell className={cn(tdClass, "font-semibold leading-snug")}>{row.testName}</TableCell>
                              <TableCell className={cn(tdClass, "text-muted-foreground")}>
                                {getLabOrderItemStatusLabelAr(row.itemStatus)}
                              </TableCell>
                              <TableCell className={cn(tdClass, "font-medium")}>{row.fieldName}</TableCell>
                              <TableCell className={cn(tdClass, "font-mono text-xs tabular-nums text-foreground")} dir="ltr">
                                {row.valueDisplay}
                              </TableCell>
                              <TableCell className={cn(tdClass, "text-muted-foreground")}>
                                <ReferenceRangeCell parts={row.reference} />
                              </TableCell>
                              <TableCell className={cn(tdClass, "text-muted-foreground")}>
                                {getEntryStatusLabelAr(row.entryStatus)}
                              </TableCell>
                              <TableCell className={tdClass}>
                                <div className="flex justify-center">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm transition-transform duration-200 group-hover:scale-[1.02]",
                                      flagBadgeClass(row.resultFlag)
                                    )}
                                  >
                                    {getResultFlagLabelAr(row.resultFlag)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className={cn(tdClass, "font-mono text-muted-foreground tabular-nums")}>
                                {idx + 1}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
