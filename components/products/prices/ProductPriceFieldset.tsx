"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ProductPriceFormValue, ProductPriceType } from "@/features/products";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { ProductPriceNotesToggle } from "./ProductPriceNotesToggle";

type Accent = "sky" | "amber" | "emerald" | "violet";

type ProductPriceFieldsetProps = {
  priceType: ProductPriceType;
  title: string;
  helper: string;
  icon: LucideIcon;
  accent: Accent;
  value: ProductPriceFormValue;
  onChange: (value: ProductPriceFormValue) => void;
  defaultExpanded: boolean;
  error?: string;
  disabled?: boolean;
};

const theme = {
  sky: { card: "border-sky-200/80 bg-sky-50/35 dark:border-sky-900 dark:bg-sky-950/25", header: "bg-sky-50/70 dark:bg-sky-950/60", icon: "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800" },
  amber: { card: "border-amber-200/80 bg-amber-50/35 dark:border-amber-900 dark:bg-amber-950/25", header: "bg-amber-50/70 dark:bg-amber-950/60", icon: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800" },
  emerald: { card: "border-emerald-200/80 bg-emerald-50/35 dark:border-emerald-900 dark:bg-emerald-950/25", header: "bg-emerald-50/70 dark:bg-emerald-950/60", icon: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800" },
  violet: { card: "border-violet-200/80 bg-violet-50/35 dark:border-violet-900 dark:bg-violet-950/25", header: "bg-violet-50/70 dark:bg-violet-950/60", icon: "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800" },
} as const;

export function ProductPriceFieldset({
  priceType,
  title,
  helper,
  icon: Icon,
  accent,
  value,
  onChange,
  defaultExpanded,
  error,
  disabled = false,
}: ProductPriceFieldsetProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded ? "price" : "");
  const visibleValue = error ? "price" : expanded;
  const colors = theme[accent];
  const prefix = `product-price-${priceType}`;

  return (
    <Accordion type="single" collapsible value={visibleValue} onValueChange={setExpanded} dir="rtl">
      <AccordionItem value="price" className={cn("overflow-hidden rounded-2xl border border-b shadow-sm", colors.card)}>
        <AccordionTrigger className={cn("px-4 py-4 text-start! hover:no-underline", colors.header)}>
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl ring-1", colors.icon)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 text-start">
              <span className="block text-sm font-bold text-foreground">{title}</span>
              <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">{helper}</span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 px-4 pb-4 sm:px-5">
          <div className="grid gap-4 rounded-xl border border-border/50 bg-background/90 p-4 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="space-y-1.5">
              <Label htmlFor={`${prefix}-amount`} className="text-[13px] text-foreground/80">
                السعر {value.is_active ? <span className="text-destructive">*</span> : null}
              </Label>
              <div className="relative">
                <Input
                  id={`${prefix}-amount`}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={value.price}
                  disabled={disabled}
                  onChange={(event) => {
                    const nextPrice = event.target.value;
                    const parsed = Number(nextPrice);
                    onChange({
                      ...value,
                      price: nextPrice,
                      is_active:
                        value.is_active ||
                        (nextPrice.trim() !== "" && Number.isFinite(parsed) && parsed > 0),
                    });
                  }}
                  placeholder="مثال: 1.50"
                  className="h-11 rounded-xl border-border/60 pl-14 text-left tabular-nums"
                  dir="ltr"
                  aria-invalid={Boolean(error)}
                />
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-muted-foreground">USD</span>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3 py-3 sm:self-end">
              <div>
                <Label htmlFor={`${prefix}-active`} className="text-[13px] text-foreground/80">حالة السعر</Label>
                <p className="text-[11px] text-muted-foreground">{value.is_active ? "فعال" : "موقوف"}</p>
              </div>
              <Switch
                id={`${prefix}-active`}
                checked={value.is_active}
                disabled={disabled}
                onCheckedChange={(checked) => onChange({ ...value, is_active: Boolean(checked) })}
              />
            </div>
          </div>
          <ProductPriceNotesToggle
            id={`${prefix}-notes`}
            value={value.notes}
            onChange={(notes) => onChange({ ...value, notes })}
            disabled={disabled}
            accent={accent}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
