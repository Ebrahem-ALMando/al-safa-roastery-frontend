"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, CircleDashed, Paperclip } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import type { LabOrderItem, LabOrderItemTestField } from "@/features/orders"
import { referenceClassificationForResultEntry } from "@/components/results/results-helpers"
import {
  orderResolvedReferenceDisplayForEntry,
  type ResultEntryPreviewBadge,
  type ResultEntryRowStatus,
} from "@/features/results/lib/result-entry-reference"
import type { LabOrderPatient } from "@/features/orders"
import { cn } from "@/lib/utils"
import { ResultEntryFieldInput } from "./result-entry-field-input"

export type RowTheme = {
  rowBg: string
  ribbon: string
  badgeClass: string
  icon: React.ReactNode
}

export type ResultEntryFieldRowProps = {
  item: LabOrderItem
  field: LabOrderItemTestField
  patient: LabOrderPatient | null
  values: Record<string, string>
  onChange: (itemId: number, fieldId: number, value: string) => void
  disabled: boolean
  index: number
  cellKey: (itemId: number, fieldId: number) => string
  previewBadge: (
    field: LabOrderItemTestField,
    raw: string,
    referenceLabel: string,
    selectOptionsRaw?: unknown
  ) => ResultEntryPreviewBadge
  rowTheme: (status: ResultEntryRowStatus) => RowTheme
  colHeaderCls: string
}

export function ResultEntryFieldRow({
  item,
  field,
  patient,
  values,
  onChange,
  disabled,
  index,
  cellKey,
  previewBadge,
  rowTheme,
  colHeaderCls,
}: ResultEntryFieldRowProps) {
  const key = cellKey(item.id, field.id)
  const raw = values[key] ?? ""
  const refDisplay = orderResolvedReferenceDisplayForEntry(field, patient)
  const existingRow = item.results.find((result) => result.test_field_id === field.id)
  const refClass = referenceClassificationForResultEntry(existingRow, field)
  const badge = previewBadge(field, raw, refClass, field.select_options)
  const theme = rowTheme(badge.status)
  const attachments = existingRow?.attachments ?? []

  const highlightClass =
    badge.status === "normal"
      ? "border-emerald-400/50 focus-visible:ring-emerald-500/30"
      : badge.status === "out_of_range" || badge.status === "invalid"
        ? "border-rose-400/50 focus-visible:ring-rose-500/30"
        : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.25 }}
      layout="position"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-3 transition-colors duration-300 sm:p-4",
          theme.rowBg
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-2 right-0 w-1 rounded-l-full transition-colors",
            theme.ribbon
          )}
        />

        <div className="grid gap-3 sm:grid-cols-12 sm:items-start">
          <div className="sm:col-span-4">
            <div className="flex items-center gap-2 text-right">
              <p className="truncate text-sm font-semibold leading-snug">
                {field.name}
                {field.is_required ? <span className="ms-1 text-destructive">*</span> : null}
              </p>
            </div>
            {field.code ? (
              <p
                className="mt-0.5 truncate text-right font-mono text-[11px] text-muted-foreground"
                dir="ltr"
              >
                {field.code}
              </p>
            ) : null}
            {!field.is_required ? (
              <p className="mt-0.5 text-[10px] text-muted-foreground">اختياري</p>
            ) : null}
          </div>

          <div className="sm:col-span-4">
            <Label className={cn(colHeaderCls, "mb-1 block sm:hidden")}>القيمة</Label>
            <ResultEntryFieldInput
              field={field}
              value={raw}
              onChange={(v) => onChange(item.id, field.id, v)}
              disabled={disabled}
              highlightClass={highlightClass}
            />
          </div>

          <div className="sm:col-span-2 sm:self-center ">
            <Label className={cn(colHeaderCls, "mb-1 block sm:hidden")}>المعدل المرجعي</Label>
            <div
              className="min-w-0 text-center"
              title={refDisplay.fullTitle ?? undefined}
            >
              <p
                className={cn(
                  "text-xs leading-relaxed tracking-normal",
                  refDisplay.useArabicTypography
                    ? "font-[family-name:var(--font-tajawal)] text-foreground/90"
                    : "font-mono tabular-nums text-foreground/85"
                )}
                dir={refDisplay.useArabicTypography ? "rtl" : "ltr"}
              >
                {refDisplay.primaryLine}
              </p>
              {refDisplay.subtleLine ? (
                <p
                  className="mt-0.5 line-clamp-2 text-right font-[family-name:var(--font-tajawal)] text-[10px] font-normal leading-snug tracking-normal text-muted-foreground"
                  dir="rtl"
                >
                  {refDisplay.subtleLine}
                </p>
              ) : null}
            </div>
          </div>

          <div className="sm:col-span-2 sm:self-center">
            <Label className={cn(colHeaderCls, "mb-1 block sm:hidden")}>التصنيف</Label>
            <div className="flex justify-end">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={badge.status + ":" + badge.label}
                  initial={{ opacity: 0, scale: 0.92, y: -2 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 2 }}
                  transition={{ duration: 0.18 }}
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold",
                      theme.badgeClass
                    )}
                  >
                    {theme.icon}
                    {badge.label}
                  </Badge>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {attachments.length > 0 ? (
          <Collapsible>
            <div className="mt-2 flex justify-end">
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 rounded-lg px-2 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="size-3.5" />
                  مرفقات ({attachments.length})
                  <ChevronDown className="size-3.5 opacity-70 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <ul className="mt-2 space-y-1 rounded-xl border border-dashed border-border/60 bg-muted/20 p-2 text-xs">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="truncate">
                    <a
                      href={attachment.url}
                      className="text-primary underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {attachment.file_name}
                    </a>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </div>
    </motion.div>
  )
}
