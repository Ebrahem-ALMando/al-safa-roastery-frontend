"use client"

import * as React from "react"
import { ClipboardList } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const medicalAccordionTriggerClass =
  "gap-3 rounded-xl px-4 py-3.5 text-start! hover:no-underline [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"

type PurchaseEditorNotesSectionProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function PurchaseEditorNotesSection({
  value,
  onChange,
  disabled = false,
}: PurchaseEditorNotesSectionProps) {
  return (
    <Accordion type="single" collapsible dir="rtl" className="space-y-0">
      <AccordionItem
        value="notes"
        className={cn(
          "overflow-hidden rounded-2xl border border-b-0 shadow-sm",
          "border-teal-200/90 bg-teal-50/40 dark:border-teal-900 dark:bg-teal-950/50"
        )}
      >
        <AccordionTrigger
          dir="rtl"
          className={cn(
            medicalAccordionTriggerClass,
            "bg-teal-50/90 hover:bg-teal-100/90 data-[state=open]:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 dark:data-[state=open]:bg-teal-900"
          )}
        >
          <span
            dir="rtl"
            className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-1.5 text-start"
          >
            <span className="flex w-full min-w-0 flex-wrap items-start gap-2 text-start">
              <span className="inline-flex flex-row-reverse items-center gap-2 text-start text-base font-semibold tracking-tight text-foreground">
                <span className="min-w-0 text-pretty">ملاحظات إضافية</span>
                <ClipboardList className="size-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
              </span>
            </span>
            <span className="text-pretty text-start text-[13px] font-normal leading-snug text-muted-foreground">
              أضف أي ملاحظات أو تفاصيل خاصة بهذه الفاتورة.
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-0 sm:px-5">
          <div
            className={cn(
              "space-y-2 rounded-xl border border-teal-200/70 bg-background p-4 dark:border-teal-900/70"
            )}
          >
            <Label htmlFor="purchase-editor-notes" className="sr-only">
              ملاحظات إضافية
            </Label>
            <Textarea
              id="purchase-editor-notes"
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              placeholder="ملاحظات (اختياري)"
              className="min-h-[100px] resize-y text-sm leading-relaxed [direction:rtl]"
              dir="rtl"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
