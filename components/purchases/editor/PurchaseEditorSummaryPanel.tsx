"use client"

import {
  BadgePercent,
  Calculator,
  Check,
  HandCoins,
  Loader2,
  Package,
  Receipt,
  Save,
  Scale,
  Truck,
  Wallet,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  onCancel: () => void
  onSaveDraft: () => void
  onComplete: () => void
  isSaving: boolean
  isCompleting: boolean
  disabled?: boolean
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

export function PurchaseEditorSummaryPanel({
  form,
  fieldErrors,
  onCancel,
  onSaveDraft,
  onComplete,
  isSaving,
  isCompleting,
  disabled = false,
}: PurchaseEditorSummaryPanelProps) {
  const subtotal = calculateSubtotal(form.lines)
  const total = calculateTotal(subtotal, form.discount)
  const remaining = calculateRemaining(total, form.paidAmount)
  const totalQuantity = form.lines.reduce((sum, line) => sum + parseAmount(line.quantityKg), 0)
  const hasRemaining = remaining > 0
  const busy = isSaving || isCompleting
  const showSubtotal = Math.abs(subtotal - total) > 0.009

  return (
    <Card className="flex max-h-[calc(100vh-7rem)] overflow-hidden border-border/60 bg-background py-0 shadow-md">
      <div className="flex min-h-0 w-full flex-col">
        <CardHeader className="shrink-0 border-b border-border/50 bg-sky-50/70 px-5 py-4 dark:bg-sky-950/20">
          <CardTitle className="flex items-start justify-between gap-3 text-xl">
            <span className="flex min-w-0 items-start gap-2">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
                <Receipt className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate">ملخص الفاتورة</span>
                <span className="mt-1 block text-xs font-medium text-muted-foreground">
                  {formatDate(form.invoiceDate)}
                </span>
              </span>
            </span>
            <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-primary shadow-sm">
              {form.lines.length} صنف
            </span>
          </CardTitle>
        </CardHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4 px-5 py-5">
            {form.supplier ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">المورد</p>
                <div
                  className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-linear-to-l from-primary/8 via-primary/4 to-transparent p-3 shadow-sm"
                  dir="rtl"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <Truck className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground sm:text-base">
                      {form.supplier.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground tabular-nums sm:text-sm" dir="ltr">
                      {form.supplier.phone || "لا يوجد هاتف"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-right text-sm text-muted-foreground">
                لم يتم اختيار مورد بعد
              </div>
            )}

            <div className="space-y-1 rounded-xl border border-border/50 bg-muted/10 p-3">
              {showSubtotal ? (
                <MoneyRow icon={Package} label="إجمالي الأصناف" value={formatUsd(subtotal)} />
              ) : null}
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
        </div>

        <div className="relative z-10 shrink-0 border-t border-border/50 bg-background p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
          <div className="grid gap-2">
            <Button
              type="button"
              className="h-12 w-full rounded-xl px-4 shadow-sm"
              onClick={onComplete}
              disabled={disabled || busy}
              aria-busy={isCompleting}
            >
              <span className="inline-flex min-w-0 items-center justify-center gap-2">
                {isCompleting ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" />
                    <span className="truncate">جارٍ الاعتماد</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4 shrink-0" />
                    <span className="truncate">اعتماد الفاتورة</span>
                  </>
                )}
              </span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-10 w-full rounded-xl gap-2"
              onClick={onSaveDraft}
              disabled={disabled || busy}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جارٍ الحفظ
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  حفظ كمسودة
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl gap-2"
              onClick={onCancel}
              disabled={busy}
            >
              <X className="size-4" />
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
