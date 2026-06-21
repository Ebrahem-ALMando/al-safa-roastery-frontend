"use client"

import {
  AlertTriangle,
  CheckCircle,
  CircleDashed,
  Loader2,
  Save,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LabOrderItem, LabOrderPatient } from "@/features/orders"
import { orderItemFieldGroupsForEntry } from "@/features/results/lib/order-item-result-sections"
import {
  computePreviewBadgeForEntry,
  fieldRowAggregateForEntry,
  type ResultEntryRowStatus,
} from "@/features/results/lib/result-entry-reference"
import { cn } from "@/lib/utils"
import { sortTestFields } from "@/components/results/results-helpers"
import { getLabOrderItemStatusLabelAr } from "@/components/orders/orders-helpers"
import { getTestIcon } from "@/components/tests/tests-helpers"
import { getTestTemplateBadgeLabel, getTestTemplateType, isTemplateTest } from "@/features/tests"
import { ResultEntryFieldRow, type RowTheme } from "./result-entry-field-row"
import { ResultEntrySectionAccordion } from "./result-entry-section-accordion"

function cellKey(itemId: number, fieldId: number): string {
  return `${itemId}:${fieldId}`
}

function rowTheme(status: ResultEntryRowStatus): RowTheme {
  switch (status) {
    case "normal":
      return {
        rowBg:
          "bg-emerald-50/55 border-emerald-500/30 hover:bg-emerald-50/85 dark:bg-emerald-950/15 dark:border-emerald-700/35 dark:hover:bg-emerald-950/25",
        ribbon: "bg-emerald-500/65",
        badgeClass:
          "border-emerald-500/35 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
        icon: <CheckCircle className="size-3.5" />,
      }
    case "out_of_range":
      return {
        rowBg:
          "bg-rose-50/60 border-rose-500/35 hover:bg-rose-50/85 dark:bg-rose-950/15 dark:border-rose-700/40 dark:hover:bg-rose-950/25",
        ribbon: "bg-rose-500/65",
        badgeClass:
          "border-rose-500/40 bg-rose-500/12 text-rose-800 dark:text-rose-200",
        icon: <AlertTriangle className="size-3.5" />,
      }
    case "invalid":
      return {
        rowBg:
          "bg-amber-50/55 border-amber-500/35 hover:bg-amber-50/80 dark:bg-amber-950/15 dark:border-amber-700/40 dark:hover:bg-amber-950/25",
        ribbon: "bg-amber-500/70",
        badgeClass:
          "border-amber-500/40 bg-amber-500/12 text-amber-800 dark:text-amber-200",
        icon: <AlertTriangle className="size-3.5" />,
      }
    case "unknown":
      return {
        rowBg:
          "bg-amber-50/35 border-amber-500/25 hover:bg-amber-50/60 dark:bg-amber-950/10 dark:border-amber-700/25",
        ribbon: "bg-amber-500/45",
        badgeClass: "border-border/60 bg-muted/30 text-muted-foreground",
        icon: <CircleDashed className="size-3.5" />,
      }
    case "unevaluated":
      return {
        rowBg:
          "bg-slate-50/50 border-slate-300/50 hover:bg-slate-50/80 dark:bg-slate-950/20 dark:border-slate-700/45 dark:hover:bg-slate-950/30",
        ribbon: "bg-slate-400/55 dark:bg-slate-600/55",
        badgeClass:
          "border-slate-300/60 bg-slate-100/80 text-slate-700 dark:border-slate-600/50 dark:bg-slate-900/50 dark:text-slate-300",
        icon: <CircleDashed className="size-3.5" />,
      }
    default:
      return {
        rowBg:
          "bg-card/40 border-border/50 hover:bg-card/70 dark:bg-card/30 dark:hover:bg-card/55",
        ribbon: "bg-slate-300/70 dark:bg-slate-700/55",
        badgeClass: "border-border/60 bg-muted/40 text-muted-foreground",
        icon: <CircleDashed className="size-3.5" />,
      }
  }
}

type ResultEntryItemCardProps = {
  item: LabOrderItem
  patient: LabOrderPatient | null
  values: Record<string, string>
  onChange: (itemId: number, fieldId: number, value: string) => void
  onSaveItem: (item: LabOrderItem) => Promise<void>
  savingItemId: number | null
  disabled: boolean
}

const colHeaderCls =
  "px-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80"

export function ResultEntryItemCard({
  item,
  patient,
  values,
  onChange,
  onSaveItem,
  savingItemId,
  disabled,
}: ResultEntryItemCardProps) {
  const fields = sortTestFields(item.test?.fields ?? [])
  const fieldGroups = orderItemFieldGroupsForEntry(item)
  const { filled: filledInItem, abnormal, total } = fieldRowAggregateForEntry(
    item,
    values,
    fields,
    cellKey
  )
  const templateType = item.test
    ? getTestTemplateType({
        test_template_type: item.test.test_template_type,
        fields: item.test.fields,
      })
    : "standard"
  const itemSaving = savingItemId === item.id
  const progressPct = total > 0 ? Math.round((filledInItem / total) * 100) : 0
  const TestIcon = getTestIcon(item.test?.icon_name)

  const accentTone =
    abnormal > 0
      ? "from-rose-500/20 via-rose-500/10 to-transparent"
      : filledInItem === total && total > 0
        ? "from-emerald-500/20 via-emerald-500/10 to-transparent"
        : filledInItem > 0
          ? "from-primary/15 via-primary/5 to-transparent"
          : "from-slate-500/10 via-slate-500/5 to-transparent"

  const headerPillCls =
    abnormal > 0
      ? "border-rose-500/30 bg-rose-500/12 text-rose-800 dark:text-rose-200"
      : filledInItem === total && total > 0
        ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200"
        : "border-primary/30 bg-primary/12 text-primary"

  const sharedRowProps = {
    item,
    patient,
    values,
    onChange,
    disabled,
    cellKey,
    previewBadge: computePreviewBadgeForEntry,
    rowTheme,
    colHeaderCls,
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md",
        "rounded-2xl"
      )}
    >
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b", accentTone)}
      />

      <div className="relative px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-card text-primary shadow-sm",
                headerPillCls
              )}
            >
              <TestIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold leading-tight">{item.test_name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                الحالة:{" "}
                <span className="font-medium text-foreground">
                  {getLabOrderItemStatusLabelAr(item.status)}
                </span>
                {fields.length > 0 ? (
                  <>
                    {" · "}
                    <span className="tabular-nums">
                      {filledInItem}/{fields.length}
                    </span>{" "}
                    حقول مدخلة
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isTemplateTest({
              test_template_type: item.test?.test_template_type,
              fields: item.test?.fields ?? [],
            }) ? (
              <Badge
                variant="outline"
                className="rounded-xl border-primary/30 bg-primary/10 text-[11px] text-primary"
              >
                {getTestTemplateBadgeLabel({
                  test_template_type: templateType,
                  fields: item.test?.fields ?? [],
                })}
              </Badge>
            ) : null}
            {abnormal > 0 ? (
              <Badge
                variant="outline"
                className="gap-1 rounded-xl border-rose-500/35 bg-rose-500/10 text-[11px] font-semibold text-rose-800 dark:text-rose-200"
              >
                <AlertTriangle className="size-3.5" />
                {abnormal} خارج المعدل
              </Badge>
            ) : filledInItem === total && total > 0 ? (
              <Badge
                variant="outline"
                className="gap-1 rounded-xl border-emerald-500/35 bg-emerald-500/10 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200"
              >
                <CheckCircle className="size-3.5" />
                مكتمل
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="gap-1 rounded-xl border-border/60 bg-muted/40 text-[11px] font-medium text-muted-foreground"
            >
              <span className="tabular-nums">{progressPct}%</span>
            </Badge>
          </div>
        </div>

        {fields.length > 0 ? (
          <div className="mt-4">
            <Progress
              value={progressPct}
              className={cn(
                "h-1.5 bg-muted/60",
                abnormal > 0
                  ? "[&>[data-slot=progress-indicator]]:bg-rose-500/70"
                  : filledInItem === total
                    ? "[&>[data-slot=progress-indicator]]:bg-emerald-500/80"
                    : "[&>[data-slot=progress-indicator]]:bg-primary/85"
              )}
            />
          </div>
        ) : null}
      </div>

      <div className="relative px-4 pb-4 pt-4 sm:px-6 sm:pb-5">
        {fields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            لم تُحمّل حقول الفحص من الخادم — تعذر الإدخال حتى يتوفر تعريف الفحص.
          </div>
        ) : (
          <>
            <div
              className="mb-2 hidden gap-3 rounded-xl bg-muted/35 px-3 py-2 sm:grid sm:grid-cols-12 sm:items-center"
              aria-hidden
            >
              <span className={cn(colHeaderCls, "col-span-4 pr-12 text-right")}>البند</span>
              <span className={cn(colHeaderCls, "col-span-4 text-center")}>القيمة</span>
              <span className={cn(colHeaderCls, "col-span-2 text-center")}>المعدل المرجعي</span>
              <span className={cn(colHeaderCls, "col-span-2 text-center")}>التصنيف</span>
            </div>

            {fieldGroups ? (
              <ResultEntrySectionAccordion groups={fieldGroups} {...sharedRowProps} />
            ) : (
              <div className="space-y-2.5 ">
                {fields.map((field, idx) => (
                  <ResultEntryFieldRow
                    key={field.id}
                    field={field}
                    index={idx}
                    {...sharedRowProps}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
              <p className="text-[11px] text-muted-foreground">
                {abnormal > 0 ? (
                  <span className="font-medium text-rose-700 dark:text-rose-300">
                    تنبيه: {abnormal} قيمة خارج المعدل في هذا الفحص
                  </span>
                ) : (
                  <span>راجع القيم قبل الحفظ — يمكنك حفظ هذا الفحص بشكل مستقل.</span>
                )}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="gap-2 rounded-xl"
                disabled={disabled || itemSaving || fields.length === 0}
                onClick={() => void onSaveItem(item)}
              >
                {itemSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                حفظ نتائج هذا الفحص
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
