"use client"

import * as React from "react"
import { Layers3 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LabOrderItem, LabOrderItemTestField, LabOrderPatient } from "@/features/orders"
import type { TestFieldSectionGroup } from "@/features/tests/lib/test-template-helpers"
import { sectionCompletionForEntry } from "@/features/results/lib/result-entry-reference"
import { cn } from "@/lib/utils"
import { ResultEntryFieldRow } from "./result-entry-field-row"
import type { ResultEntryFieldRowProps } from "./result-entry-field-row"

const accordionTriggerClass =
  "gap-3 rounded-xl px-4 py-3.5 text-start! hover:no-underline [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"

const SECTION_STYLES = [
  {
    shell: "border-primary/25 bg-primary/5 dark:border-primary/30 dark:bg-primary/10",
    trigger:
      "bg-primary/8 hover:bg-primary/12 data-[state=open]:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/20 dark:data-[state=open]:bg-primary/25",
    iconTint: "text-primary",
    inner: "border-primary/20 bg-background dark:border-primary/25",
  },
  {
    shell: "border-sky-200/90 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/50",
    trigger:
      "bg-sky-50/90 hover:bg-sky-100/90 data-[state=open]:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 dark:data-[state=open]:bg-sky-900",
    iconTint: "text-sky-600 dark:text-sky-400",
    inner: "border-sky-200/70 bg-background dark:border-sky-900/70",
  },
  {
    shell: "border-teal-200/90 bg-teal-50/40 dark:border-teal-900 dark:bg-teal-950/50",
    trigger:
      "bg-teal-50/90 hover:bg-teal-100/90 data-[state=open]:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 dark:data-[state=open]:bg-teal-900",
    iconTint: "text-teal-600 dark:text-teal-400",
    inner: "border-teal-200/70 bg-background dark:border-teal-900/70",
  },
  {
    shell: "border-violet-200/90 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/50",
    trigger:
      "bg-violet-50/90 hover:bg-violet-100/90 data-[state=open]:bg-violet-100 dark:bg-violet-950 dark:hover:bg-violet-900 dark:data-[state=open]:bg-violet-900",
    iconTint: "text-violet-600 dark:text-violet-400",
    inner: "border-violet-200/70 bg-background dark:border-violet-900/70",
  },
  {
    shell: "border-amber-200/90 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/50",
    trigger:
      "bg-amber-50/90 hover:bg-amber-100/90 data-[state=open]:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 dark:data-[state=open]:bg-amber-900",
    iconTint: "text-amber-700 dark:text-amber-400",
    inner: "border-amber-200/70 bg-background dark:border-amber-900/70",
  },
] as const

type SharedRowProps = Pick<
  ResultEntryFieldRowProps,
  | "item"
  | "patient"
  | "values"
  | "onChange"
  | "disabled"
  | "cellKey"
  | "previewBadge"
  | "rowTheme"
  | "colHeaderCls"
>

type ResultEntrySectionAccordionProps = SharedRowProps & {
  groups: TestFieldSectionGroup[]
}

function SectionHeader({
  label,
  completed,
  total,
  requiredMissing,
  iconTint,
}: {
  label: string
  completed: number
  total: number
  requiredMissing: number
  iconTint: string
}) {
  return (
    <span dir="rtl" className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-1.5 text-start">
      <span className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 text-start">
        <span className="inline-flex flex-row-reverse items-center gap-2 text-start text-base font-semibold tracking-tight text-foreground">
          <span className="min-w-0 text-pretty">{label}</span>
          <Layers3 className={cn("size-4 shrink-0", iconTint)} aria-hidden />
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="rounded-lg border-border/60 bg-background/80 text-[10px] font-medium tabular-nums"
          >
            {completed}/{total}
          </Badge>
          {requiredMissing > 0 ? (
            <Badge
              variant="outline"
              className="rounded-lg border-amber-500/35 bg-amber-500/10 text-[10px] font-medium text-amber-900 dark:text-amber-100"
            >
              مطلوب: {requiredMissing}
            </Badge>
          ) : null}
        </span>
      </span>
    </span>
  )
}

export function ResultEntrySectionAccordion({
  groups,
  item,
  patient,
  values,
  onChange,
  disabled,
  cellKey,
  previewBadge,
  rowTheme,
  colHeaderCls,
}: ResultEntrySectionAccordionProps) {
  const sectionKeys = React.useMemo(
    () => groups.map((group) => group.sectionKey),
    [groups]
  )

  const [openSections, setOpenSections] = React.useState<string[]>([])

  React.useEffect(() => {
    if (sectionKeys.length === 0) return
    setOpenSections((prev) => {
      if (prev.length === 0) return sectionKeys
      const kept = sectionKeys.filter((key) => prev.includes(key))
      const added = sectionKeys.filter((key) => !prev.includes(key))
      return [...kept, ...added]
    })
  }, [sectionKeys.join(",")])

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs"
          onClick={() => setOpenSections(sectionKeys)}
        >
          فتح الكل
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs"
          onClick={() => setOpenSections([])}
        >
          إغلاق الكل
        </Button>
      </div>

      <Accordion
        type="multiple"
        dir="rtl"
        value={openSections}
        onValueChange={setOpenSections}
        className="space-y-3"
      >
        {groups.map((group, groupIndex) => {
          const ui = SECTION_STYLES[groupIndex % SECTION_STYLES.length]
          const stats = sectionCompletionForEntry(
            item,
            group.fields as LabOrderItemTestField[],
            values,
            cellKey
          )

          return (
            <AccordionItem
              key={group.sectionKey}
              value={group.sectionKey}
              className={cn(
                "overflow-hidden rounded-2xl border border-b-0 shadow-sm",
                ui.shell
              )}
            >
              <AccordionTrigger
                dir="rtl"
                className={cn(accordionTriggerClass, ui.trigger)}
              >
                <SectionHeader
                  label={group.label}
                  completed={stats.completed}
                  total={stats.total}
                  requiredMissing={stats.requiredMissing}
                  iconTint={ui.iconTint}
                />
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-0 sm:px-4">
                <div className={cn("space-y-2 rounded-xl border p-2 sm:p-3", ui.inner)}>
                  {group.fields.map((field, idx) => (
                    <ResultEntryFieldRow
                      key={field.id}
                      item={item}
                      field={field as LabOrderItemTestField}
                      patient={patient}
                      values={values}
                      onChange={onChange}
                      disabled={disabled}
                      index={idx}
                      cellKey={cellKey}
                      previewBadge={previewBadge}
                      rowTheme={rowTheme}
                      colHeaderCls={colHeaderCls}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
