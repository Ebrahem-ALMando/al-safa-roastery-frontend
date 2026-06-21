"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { GitCompareArrows } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  formatOrderItemResultReferenceParts,
  formatResultValue,
} from "@/components/orders/orders-helpers"
import { ReferenceRangeCell } from "@/components/orders/reference-range-cell"
import {
  effectiveResultFlagForDisplay,
  hasEvaluableReferenceForResult,
} from "@/components/results/results-helpers"
import type { LabOrderItem, LabOrderItemResult } from "@/features/orders"
import {
  buildOrderItemResultSectionGroups,
  findOrderItemFieldForResult,
  shouldGroupOrderItemResults,
  sortOrderItemResultsByFieldOrder,
} from "@/features/results/lib/order-item-result-sections"
import { filterResultsForReport } from "@/features/results/lib/report-result-inclusion"
import { getTestTemplateBadgeLabel, isTemplateTest } from "@/features/tests/lib/test-template-helpers"
import { containsArabicScript, tajawalFontClass, typographyClassForText } from "@/lib/arabic-typography"
import { cn } from "@/lib/utils"
import {
  computeTrendDirection,
  normalizeFieldKey,
  parseNumericResult,
  rowsToComparisonEntries,
  type FlatResultRow,
} from "./patient-detail-data"
import { PatientResultTrendChart } from "./patient-result-trend-chart"
import { ResultFlagBadge } from "./result-flag-badge"
import { InlineTrendIcon } from "./patient-result-comparison-dialog"

type PatientOrderItemResultsProps = {
  item: LabOrderItem
  orderId: number
  visibleResultIds: Set<number>
  comparable: Map<string, FlatResultRow[]>
  onCompare: (row: FlatResultRow) => void
}

function PatientResultStatusBadge({
  result,
  item,
}: {
  result: LabOrderItemResult
  item: LabOrderItem
}) {
  const field = findOrderItemFieldForResult(item, result)
  const hasRef = hasEvaluableReferenceForResult(result, field)
  const displayFlag = effectiveResultFlagForDisplay(
    result,
    field?.select_options,
    field ?? null
  )

  if (!hasRef && displayFlag == null) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "rounded-lg border-border/70 bg-muted/40 px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground",
          tajawalFontClass
        )}
      >
        بدون نطاق
      </Badge>
    )
  }

  if (displayFlag == null) {
    return <span className="text-[11px] text-muted-foreground">—</span>
  }

  return <ResultFlagBadge flag={displayFlag} size="md" />
}

function ComparisonCell({
  fieldKey,
  orderId,
  fieldName,
  testName,
  value,
  comparable,
  onCompare,
}: {
  fieldKey: string
  orderId: number
  fieldName: string
  testName: string
  value: string
  comparable: Map<string, FlatResultRow[]>
  onCompare: (row: FlatResultRow) => void
}) {
  const compRows = comparable.get(fieldKey)
  const isComparable = (compRows?.length ?? 0) >= 2
  const sortedComp = compRows ?? []
  const chronoIndex = sortedComp.findIndex(
    (r) => r.orderId === orderId && r.fieldName === fieldName && r.testName === testName
  )
  const prevRow = chronoIndex > 0 ? sortedComp[chronoIndex - 1]! : null
  const trend = computeTrendDirection(
    parseNumericResult(value),
    prevRow ? parseNumericResult(prevRow.value) : null
  )

  if (!isComparable) {
    return <span className="text-[11px] text-muted-foreground">—</span>
  }

  const anchor = sortedComp[chronoIndex] ?? sortedComp[sortedComp.length - 1]!

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group/cmp inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-300/70 bg-amber-50/90 pe-2 ps-1 text-[10.5px] font-bold text-amber-900 shadow-sm dark:border-amber-800/55 dark:bg-amber-950/40 dark:text-amber-100"
            onClick={() => onCompare(anchor)}
          >
            <span className="pointer-events-none w-[60px] shrink-0 overflow-hidden rounded-md">
              <PatientResultTrendChart
                entries={rowsToComparisonEntries(sortedComp)}
                compact
                className="border-0 bg-transparent shadow-none"
              />
            </span>
            <GitCompareArrows className="size-3" />
            <span dir="ltr" className="font-mono text-[9px]">
              {sortedComp.length}
            </span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px] text-right" dir="rtl">
          <p className="text-xs font-semibold">مقارنة عبر {sortedComp.length} طلبات</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ResultDataRow({
  item,
  result,
  orderId,
  comparable,
  onCompare,
}: {
  item: LabOrderItem
  result: LabOrderItemResult
  orderId: number
  comparable: Map<string, FlatResultRow[]>
  onCompare: (row: FlatResultRow) => void
}) {
  const field = findOrderItemFieldForResult(item, result)
  const fieldName = result.field_name?.trim() || "—"
  const fieldKey = normalizeFieldKey(fieldName, item.test_name)
  const valueStr = formatResultValue(result.value)
  const displayFlag = effectiveResultFlagForDisplay(
    result,
    field?.select_options,
    field ?? null
  )
  const hasRef = hasEvaluableReferenceForResult(result, field)
  const compRows = comparable.get(fieldKey)
  const sortedComp = compRows ?? []
  const chronoIndex = sortedComp.findIndex(
    (r) => r.orderId === orderId && r.fieldName === fieldName && r.testName === item.test_name
  )
  const prevRow = chronoIndex > 0 ? sortedComp[chronoIndex - 1]! : null
  const trend = computeTrendDirection(
    parseNumericResult(valueStr),
    prevRow ? parseNumericResult(prevRow.value) : null
  )
  const isComparable = sortedComp.length >= 2
  const valueDisplay = [valueStr, result.unit?.trim()].filter(Boolean).join(" ") || "—"
  const valueIsArabic = containsArabicScript(valueDisplay)

  const rowHighlight =
    hasRef && displayFlag && displayFlag !== "normal"
      ? displayFlag === "low"
        ? "bg-sky-50/50 dark:bg-sky-950/20"
        : displayFlag === "high"
          ? "bg-amber-50/50 dark:bg-amber-950/20"
          : "bg-rose-50/40 dark:bg-rose-950/20"
      : undefined

  return (
    <TableRow className={cn("border-border/40", rowHighlight)}>
      <TableCell
        className={cn(
          "py-1.5 text-right text-xs font-medium",
          typographyClassForText(fieldName, { monoWhenNonArabic: true })
        )}
      >
        {fieldName}
      </TableCell>
      <TableCell className="py-1.5 text-center">
        <div className="flex items-center justify-center gap-1">
          {isComparable ? <InlineTrendIcon direction={trend} /> : null}
          <span
            className={cn(
              "text-xs font-semibold",
              valueIsArabic ? tajawalFontClass : "font-mono tabular-nums"
            )}
            dir={valueIsArabic ? "rtl" : "ltr"}
          >
            {valueDisplay}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-1.5 text-center text-[11px]">
        <ReferenceRangeCell parts={formatOrderItemResultReferenceParts(item, result)} />
      </TableCell>
      <TableCell className="py-1.5 text-center align-middle">
        <div className="flex justify-center">
          <PatientResultStatusBadge result={result} item={item} />
        </div>
      </TableCell>
      <TableCell className="py-1.5 text-center align-middle">
        <ComparisonCell
          fieldKey={fieldKey}
          orderId={orderId}
          fieldName={fieldName}
          testName={item.test_name}
          value={valueStr}
          comparable={comparable}
          onCompare={onCompare}
        />
      </TableCell>
    </TableRow>
  )
}

/** أعمدة موحّدة لكل أقسام القالب (table-fixed + colgroup) */
const PATIENT_RESULT_TABLE_CLASS = "w-full table-fixed text-xs"

function PatientResultsColGroup() {
  return (
    <colgroup>
      <col style={{ width: "30%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "22%" }} />
      <col style={{ width: "16%" }} />
      <col style={{ width: "14%" }} />
    </colgroup>
  )
}

const patientResultHeadClass = cn("py-1.5 text-[11px] font-semibold", tajawalFontClass)

const PATIENT_RESULT_TABLE_HEAD = (
  <TableRow className="bg-muted/40 hover:bg-muted/40">
    <TableHead className={cn(patientResultHeadClass, "text-right")}>الفحص</TableHead>
    <TableHead className={cn(patientResultHeadClass, "text-center")}>النتيجة</TableHead>
    <TableHead className={cn(patientResultHeadClass, "text-center")}>المرجع</TableHead>
    <TableHead className={cn(patientResultHeadClass, "text-center")}>الحالة</TableHead>
    <TableHead className={cn(patientResultHeadClass, "text-center")}>المقارنة</TableHead>
  </TableRow>
)

function SectionDividerRow({ label, isFirst }: { label: string; isFirst?: boolean }) {
  return (
    <TableRow
      className={cn(
        "bg-muted/20 hover:bg-muted/20",
        !isFirst && "border-t-2 border-border/55"
      )}
    >
      <TableCell
        colSpan={5}
        className={cn(
          "py-1.5 pe-3 ps-3 text-right text-[11px] font-semibold leading-tight text-foreground/90",
          tajawalFontClass
        )}
      >
        {label}
      </TableCell>
    </TableRow>
  )
}

function ResultsTableBody({
  item,
  results,
  orderId,
  comparable,
  onCompare,
}: {
  item: LabOrderItem
  results: LabOrderItemResult[]
  orderId: number
  comparable: Map<string, FlatResultRow[]>
  onCompare: (row: FlatResultRow) => void
}) {
  return (
    <TableBody>
      {results.map((result) => (
        <ResultDataRow
          key={result.id}
          item={item}
          result={result}
          orderId={orderId}
          comparable={comparable}
          onCompare={onCompare}
        />
      ))}
    </TableBody>
  )
}

function SectionedResults({ item, orderId, visibleResultIds, comparable, onCompare }: PatientOrderItemResultsProps) {
  const filteredItem: LabOrderItem = React.useMemo(() => {
    const visible = filterResultsForReport(item).filter((r) => visibleResultIds.has(r.id))
    return { ...item, results: visible }
  }, [item, visibleResultIds])

  const sectionGroups = buildOrderItemResultSectionGroups(filteredItem, { preferArabic: true })

  if (!sectionGroups?.length) {
    return null
  }

  const nonEmptyGroups = sectionGroups.filter((g) => g.results.length > 0)

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50">
      <Table className={PATIENT_RESULT_TABLE_CLASS} dir="rtl">
        <PatientResultsColGroup />
        <TableHeader>{PATIENT_RESULT_TABLE_HEAD}</TableHeader>
        <TableBody>
          {nonEmptyGroups.map((group, index) => (
            <React.Fragment key={group.sectionKey}>
              <SectionDividerRow label={group.label} isFirst={index === 0} />
              {group.results.map((result) => (
                <ResultDataRow
                  key={result.id}
                  item={item}
                  result={result}
                  orderId={orderId}
                  comparable={comparable}
                  onCompare={onCompare}
                />
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function FlatItemResults({ item, orderId, visibleResultIds, comparable, onCompare }: PatientOrderItemResultsProps) {
  const rows = sortOrderItemResultsByFieldOrder(
    item,
    filterResultsForReport(item).filter((r) => visibleResultIds.has(r.id))
  )

  if (rows.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50">
      <Table className={PATIENT_RESULT_TABLE_CLASS} dir="rtl">
        <PatientResultsColGroup />
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className={cn(patientResultHeadClass, "text-right")}>البند</TableHead>
            <TableHead className={cn(patientResultHeadClass, "text-center")}>النتيجة</TableHead>
            <TableHead className={cn(patientResultHeadClass, "text-center")}>المرجع</TableHead>
            <TableHead className={cn(patientResultHeadClass, "text-center")}>الحالة</TableHead>
            <TableHead className={cn(patientResultHeadClass, "text-center")}>المقارنة</TableHead>
          </TableRow>
        </TableHeader>
        <ResultsTableBody
          item={item}
          results={rows}
          orderId={orderId}
          comparable={comparable}
          onCompare={onCompare}
        />
      </Table>
    </div>
  )
}

export function PatientOrderItemResults(props: PatientOrderItemResultsProps) {
  const { item } = props
  const testCode = item.test?.code?.trim()
  const showTemplateBadge = item.test != null && isTemplateTest(item.test)
  const grouped = shouldGroupOrderItemResults(item)

  const visibleCount = filterResultsForReport(item).filter((r) =>
    props.visibleResultIds.has(r.id)
  ).length

  if (visibleCount === 0) return null

  return (
    <article className="rounded-xl border border-border/55 bg-card/40 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
        <div className="min-w-0">
          <h4
            className={cn(
              "text-sm font-bold leading-tight",
              typographyClassForText(item.test_name)
            )}
          >
            {item.test_name}
          </h4>
          {testCode ? (
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground" dir="ltr">
              {testCode}
            </p>
          ) : null}
        </div>
        {showTemplateBadge ? (
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-lg text-[10px] font-medium text-muted-foreground",
              tajawalFontClass
            )}
          >
            {getTestTemplateBadgeLabel(item.test!, true)}
          </Badge>
        ) : null}
      </header>
      <div className="p-2 sm:p-2.5">
        {grouped ? (
          <SectionedResults {...props} />
        ) : (
          <FlatItemResults {...props} />
        )}
      </div>
    </article>
  )
}
