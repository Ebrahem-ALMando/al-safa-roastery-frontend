"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

type ProductPriceNotesToggleProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  accent: "sky" | "amber" | "emerald" | "violet";
};

const theme = {
  sky: {
    item: "border-sky-200/90 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/50",
    trigger: "bg-sky-50/90 hover:bg-sky-100/90 data-[state=open]:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 dark:data-[state=open]:bg-sky-900",
    icon: "text-sky-600 dark:text-sky-400",
    content: "border-sky-200/70 dark:border-sky-900/70",
  },
  amber: {
    item: "border-amber-200/90 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/50",
    trigger: "bg-amber-50/90 hover:bg-amber-100/90 data-[state=open]:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 dark:data-[state=open]:bg-amber-900",
    icon: "text-amber-600 dark:text-amber-400",
    content: "border-amber-200/70 dark:border-amber-900/70",
  },
  emerald: {
    item: "border-emerald-200/90 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/50",
    trigger: "bg-emerald-50/90 hover:bg-emerald-100/90 data-[state=open]:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:data-[state=open]:bg-emerald-900",
    icon: "text-emerald-600 dark:text-emerald-400",
    content: "border-emerald-200/70 dark:border-emerald-900/70",
  },
  violet: {
    item: "border-violet-200/90 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/50",
    trigger: "bg-violet-50/90 hover:bg-violet-100/90 data-[state=open]:bg-violet-100 dark:bg-violet-950 dark:hover:bg-violet-900 dark:data-[state=open]:bg-violet-900",
    icon: "text-violet-600 dark:text-violet-400",
    content: "border-violet-200/70 dark:border-violet-900/70",
  },
} as const;

export function ProductPriceNotesToggle({
  id,
  value,
  onChange,
  disabled = false,
  accent,
}: ProductPriceNotesToggleProps) {
  const colors = theme[accent];
  return (
    <Accordion type="single" collapsible dir="rtl" className="space-y-0">
      <AccordionItem
        value="notes"
        className={cn("overflow-hidden rounded-2xl border border-b-0 shadow-sm", colors.item)}
      >
        <AccordionTrigger
          dir="rtl"
          className={cn(
            "gap-3 rounded-xl px-4 py-3.5 text-start! hover:no-underline [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
            colors.trigger,
          )}
        >
          <span dir="rtl" className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-1.5 text-start">
            <span className="flex w-full min-w-0 flex-wrap items-start gap-2 text-start">
              <span className="inline-flex flex-row-reverse items-center gap-2 text-start text-base font-semibold tracking-tight text-foreground">
                <span className="min-w-0 text-pretty">ملاحظات السعر</span>
                <ClipboardList className={cn("size-4 shrink-0", colors.icon)} aria-hidden />
              </span>
            </span>
            <span className="text-pretty text-start text-[13px] font-normal leading-snug text-muted-foreground">
              أضف ملاحظات خاصة بهذا السعر عند الحاجة.
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-0 sm:px-5">
          <div className={cn("space-y-2 rounded-xl border bg-background p-4", colors.content)}>
            <Label htmlFor={id} className="sr-only">ملاحظات السعر</Label>
            <Textarea
              id={id}
              value={value}
              disabled={disabled}
              onChange={(event) => onChange(event.target.value)}
              placeholder="ملاحظات السعر (اختياري)"
              className="min-h-[100px] resize-y text-sm leading-relaxed [direction:rtl]"
              dir="rtl"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
