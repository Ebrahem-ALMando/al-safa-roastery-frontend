"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LabOrderItem, LabOrderResultFlag } from "@/features/orders"
import {
  buildOrderItemResultSectionGroups,
  findOrderItemFieldForResult,
  shouldGroupOrderItemResults,
  sortOrderItemResultsByFieldOrder,
} from "@/features/results/lib/order-item-result-sections"
import { effectiveResultFlagForDisplay } from "@/components/results/results-helpers"
import {
  formatOrderItemResultReferenceParts,
  formatResultValue,
  getEntryStatusLabelAr,
  getResultFlagLabelAr,
  getResultFlagRowClassName,
} from "@/components/orders/orders-helpers"
import { ReferenceRangeCell } from "@/components/orders/reference-range-cell"
import { cn } from "@/lib/utils"

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

type GroupedItemResultsProps = {
  item: LabOrderItem
  compact?: boolean
}

function ResultValueRow({
  item,
  result,
}: {
  item: LabOrderItem
  result: LabOrderItem["results"][number]
}) {
  const testField = findOrderItemFieldForResult(item, result)
  const displayFlag = effectiveResultFlagForDisplay(
    result,
    testField?.select_options,
    testField ?? null
  )

  return (
    <TableRow className={cn("border-border/50", getResultFlagRowClassName(displayFlag))}>
      <TableCell className="max-w-[160px] text-right font-medium">{result.field_name}</TableCell>
      <TableCell className="text-center font-mono text-xs" dir="ltr">
        {[formatResultValue(result.value), result.unit?.trim()].filter(Boolean).join(" ") || "—"}
      </TableCell>
      <TableCell className="text-center text-muted-foreground">
        <ReferenceRangeCell parts={formatOrderItemResultReferenceParts(item, result)} />
      </TableCell>
      <TableCell className="text-center text-[11px]">{getResultFlagLabelAr(displayFlag)}</TableCell>
      <TableCell className="text-center text-[11px]">{getEntryStatusLabelAr(result.entry_status)}</TableCell>
    </TableRow>
  )
}

function FlatResultsTable({ item }: { item: LabOrderItem }) {
  const rows = sortOrderItemResultsByFieldOrder(item, item.results ?? [])

  if (rows.length === 0) {
    return (
      <p className="rounded-xl bg-muted/40 p-3 text-center text-sm text-muted-foreground">
        لا توجد نتائج مسجّلة لهذا البند.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <Table className="text-xs sm:text-sm" dir="rtl">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-right font-semibold">البند</TableHead>
            <TableHead className="text-center font-semibold">القيمة</TableHead>
            <TableHead className="text-center font-semibold">مرجعي</TableHead>
            <TableHead className="text-center font-semibold">التصنيف</TableHead>
            <TableHead className="text-center font-semibold">حالة الإدخال</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((result) => (
            <ResultValueRow key={result.id} item={item} result={result} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function GroupedItemResults({ item, compact = false }: GroupedItemResultsProps) {
  const sectionGroups = buildOrderItemResultSectionGroups(item)

  if (!shouldGroupOrderItemResults(item) || !sectionGroups) {
    return <FlatResultsTable item={item} />
  }

  if (sectionGroups.every((group) => group.results.length === 0)) {
    return (
      <p className="rounded-xl bg-muted/40 p-3 text-center text-sm text-muted-foreground">
        لا توجد نتائج مسجّلة لهذا البند.
      </p>
    )
  }

  return (
    <div className={cn("space-y-3", compact ? "space-y-2" : "space-y-3.5")}>
      {sectionGroups.map((group) => {
        if (group.results.length === 0) {
          return null
        }

        return (
          <section
            key={group.sectionKey}
            className="overflow-hidden rounded-xl border border-border/55 bg-muted/15"
          >
            <div className="border-b border-border/45 bg-card/70 px-3 py-2 sm:px-4">
              <h6 className="text-xs font-semibold leading-tight sm:text-sm">{group.label}</h6>
            </div>
            <div className="p-2 sm:p-3">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <Table className="text-xs sm:text-sm" dir="rtl">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-right font-semibold">البند</TableHead>
                      <TableHead className="text-center font-semibold">القيمة</TableHead>
                      <TableHead className="text-center font-semibold">مرجعي</TableHead>
                      <TableHead className="text-center font-semibold">التصنيف</TableHead>
                      <TableHead className="text-center font-semibold">حالة الإدخال</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.results.map((result) => (
                      <ResultValueRow key={result.id} item={item} result={result} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function GroupedItemResultsBadge({ item }: { item: LabOrderItem }) {
  if (!shouldGroupOrderItemResults(item)) {
    return null
  }

  return (
    <Badge variant="outline" className="rounded-lg text-[10px] text-muted-foreground">
      أقسام القالب
    </Badge>
  )
}
