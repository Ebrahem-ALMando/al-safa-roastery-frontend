"use client"

import {
  BadgePercent,
  CalendarDays,
  Calculator,
  HandCoins,
  Hash,
  Package,
  Receipt,
  Scale,
  UserRound,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  calculateRemaining,
  calculateSubtotal,
  calculateTotal,
} from "@/features/purchases/lib/purchase-editor.helpers"
import { formatUsd } from "@/features/purchases"
import type { PurchaseEditorFormState } from "@/features/purchases/types/purchase-editor.types"

type PurchaseEditorSummaryPanelProps = {
  form: PurchaseEditorFormState
  fieldErrors: Record<string, string | undefined>
}

function parseAmount(value: string | number): number {
  const parsed = Number.parseFloat(String(value).replaceAll(",", ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatKg(value: number): string {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })} كغ`
}

function formatDate(value: string): string {
  const [year, month, day] = value.split("-")
  return year && month && day ? `${day}/${month}/${year}` : "غير محدد"
}

function SummaryMeta({
  icon: Icon,
  label,
  value,
  empty,
}: {
  icon: LucideIcon
  label: string
  value: string
  empty?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
        empty ? "border-dashed border-border/70 bg-muted/10" : "border-border/50 bg-background"
      )}
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className={cn("size-4 shrink-0", empty ? "text-muted-foreground" : "text-primary")} />
        <span>{label}</span>
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-left text-sm",
          empty ? "text-muted-foreground" : "font-semibold text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  )
}

function MoneyRow({
  icon: Icon,
  label,
  value,
  muted,
  strong,
}: {
  icon: LucideIcon
  label: string
  value: string
  muted?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-1 py-1.5">
      <span className={cn("flex items-center gap-2 text-sm", muted ? "text-muted-foreground" : "text-foreground")}>
        <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
        <span className={cn(strong && "font-bold")}>{label}</span>
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          strong ? "text-xl font-black text-foreground" : "text-sm font-bold text-foreground",
          muted && "text-muted-foreground"
        )}
        dir="ltr"
      >
        {value}
      </span>
    </div>
  )
}

export function PurchaseEditorSummaryPanel({ form, fieldErrors }: PurchaseEditorSummaryPanelProps) {
  const subtotal = calculateSubtotal(form.lines)
  const total = calculateTotal(subtotal, form.discount)
  const remaining = calculateRemaining(total, form.paidAmount)
  const totalQuantity = form.lines.reduce((sum, line) => sum + parseAmount(line.quantityKg), 0)
  const hasRemaining = remaining > 0

  return (
    <Card className="gap-0 overflow-hidden border-border/60 bg-background py-0 shadow-md">
      <CardHeader className="border-b border-border/50 bg-sky-50/70 px-5 py-4 dark:bg-sky-950/20">
        <CardTitle className="flex items-center justify-between gap-3 text-xl">
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
              <Receipt className="size-5" />
            </span>
            <span className="truncate">ملخص الفاتورة</span>
          </span>
          <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-primary shadow-sm">
            {form.lines.length} صنف
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-5">
        <div className="space-y-2">
          <SummaryMeta
            icon={UserRound}
            label="المورد"
            value={form.supplier?.name || "لم يتم اختيار مورد بعد"}
            empty={!form.supplier}
          />
          <SummaryMeta icon={CalendarDays} label="التاريخ" value={formatDate(form.invoiceDate)} />
          <SummaryMeta
            icon={Hash}
            label="رقم المورد"
            value={form.invoiceNumber.trim() || "لا يوجد رقم خارجي"}
            empty={!form.invoiceNumber.trim()}
          />
        </div>

        <div className="space-y-1 rounded-xl border border-border/50 bg-muted/10 p-3">
          <MoneyRow icon={Package} label="إجمالي الأصناف" value={formatUsd(subtotal)} />
          <MoneyRow icon={Scale} label="الكمية" value={formatKg(totalQuantity)} muted />
          <MoneyRow icon={BadgePercent} label="الخصم" value={formatUsd(form.discount)} muted />
          <Separator className="my-2" />
          <MoneyRow icon={Calculator} label="الإجمالي النهائي" value={formatUsd(total)} strong />
          <MoneyRow icon={Wallet} label="المدفوع" value={formatUsd(form.paidAmount)} />
        </div>

        <div
          className={cn(
            "rounded-xl border px-4 py-3",
            hasRemaining
              ? "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100"
              : "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-100"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-background/70">
                <HandCoins className="size-4" />
              </span>
              المتبقي للمورد
            </span>
            <span className="shrink-0 text-2xl font-black tabular-nums" dir="ltr">
              {formatUsd(remaining)}
            </span>
          </div>
        </div>

        {fieldErrors.paid_amount ? (
          <p className="text-[11px] font-medium text-destructive" role="alert">
            {fieldErrors.paid_amount}
          </p>
        ) : null}
        {fieldErrors.discount ? (
          <p className="text-[11px] font-medium text-destructive" role="alert">
            {fieldErrors.discount}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
