"use client"

import { AlertTriangle, ClipboardList } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type NotesTone = "rose" | "amber" | "emerald"

const TONE_CLASSES: Record<NotesTone, string> = {
  rose: "border-rose-200/80 bg-rose-50/35 dark:border-rose-900/60 dark:bg-rose-950/15",
  amber: "border-amber-200/80 bg-amber-50/35 dark:border-amber-900/60 dark:bg-amber-950/15",
  emerald: "border-emerald-200/80 bg-emerald-50/35 dark:border-emerald-900/60 dark:bg-emerald-950/15",
}

const ICON_CLASSES: Record<NotesTone, string> = {
  rose: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
}

export function OperationNotesAccordion({ value, onChange, placeholder, tone, disabled = false }: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  tone: NotesTone
  disabled?: boolean
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="notes" className={cn("overflow-hidden rounded-xl border last:border-b", TONE_CLASSES[tone])}>
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="flex items-center gap-2">
            <ClipboardList className={cn("size-4", ICON_CLASSES[tone])} />
            ملاحظات
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-5">
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="min-h-28 resize-y border-border/80 bg-background/90"
            disabled={disabled}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function OtherReasonHelper() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2.5 text-right text-xs font-medium leading-5 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/30 dark:text-amber-100" dir="rtl">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>يمكنك توضيح السبب ضمن الملاحظات.</span>
    </div>
  )
}
