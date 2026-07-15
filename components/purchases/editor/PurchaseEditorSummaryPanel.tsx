"use client"

import type { ReactNode } from "react"
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

function parseAmount(value: string | number | null | undefined): number {
  const parsed = Number.parseFloat(String(value).replaceAll(",", ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatKgAmount(value: number): string {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`
}

function formatDate(value: string): string {
  const [year, month, day] = value.split("-")
  return year && month && day ? `${day}/${month}/${year}` : "غير محدد"
}

type BalanceTone = "warning" | "success" | "neutral"

function getSupplierBalanceLabel(balance: number): string {
  if (balance > 0.009) return "علينا للمورد"
  if (balance < -0.009) return "رصيد لصالحنا"
  return "متوازن"
}

function BalanceCallout({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  hint?: string
  tone: BalanceTone
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        tone === "warning" &&
          "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-100",
        tone === "neutral" &&
          "border-sky-200 bg-sky-50/80 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/25 dark:text-sky-100"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-xs font-bold sm:text-sm">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background/70">
            <Icon className="size-3.5" />
          </span>
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 font-mono text-xl font-extrabold tabular-nums" dir="ltr">
          {value}
        </span>
      </div>
      {hint ? (
        <p className="mt-1 truncate text-[11px] font-medium leading-snug opacity-75">
          {hint}
        </p>
      ) : null}
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
  value: ReactNode
  muted?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-1 py-1">
      <span className={cn("flex items-center gap-2 text-sm", muted ? "text-muted-foreground" : "text-foreground")}>
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
        <span className={cn(strong && "font-bold")}>{label}</span>
      </span>
      <span
        className={cn(
          "shrink-0 font-mono tabular-nums",
          strong ? "text-lg font-extrabold text-foreground" : "text-sm font-bold text-foreground",
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
  const currentSupplierBalance = parseAmount(form.supplier?.current_balance)
  const supplierBalanceAfterInvoice = currentSupplierBalance + remaining
  const supplierBalanceLabel = getSupplierBalanceLabel(supplierBalanceAfterInvoice)
  const supplierBalanceTone: BalanceTone =
    supplierBalanceAfterInvoice > 0.009 ? "warning" : supplierBalanceAfterInvoice < -0.009 ? "success" : "neutral"

  return (
    <Card className="flex max-h-[calc(100vh-7rem)] overflow-hidden border-border/60 bg-background py-0 shadow-md">
      <div className="flex min-h-0 w-full flex-col">
        <CardHeader className="shrink-0 border-b border-border/50 bg-sky-50/70 px-4 py-2.5 dark:bg-sky-950/20">
          <CardTitle className="flex items-start justify-between gap-3 text-lg">
            <span className="flex min-w-0 items-start gap-2">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-sm">
                <Receipt className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate">ملخص الفاتورة</span>
                <span className="mt-0.5 block font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
                  {formatDate(form.invoiceDate)}
                </span>
              </span>
            </span>
            <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-bold text-primary shadow-sm">
              {form.lines.length} صنف
            </span>
          </CardTitle>
        </CardHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-2.5 px-4 py-3">
            {form.supplier ? (
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">المورد</p>
                <div
                  className="flex items-center gap-2 rounded-xl border border-primary/20 bg-linear-to-l from-primary/8 via-primary/4 to-transparent p-2 shadow-sm"
                  dir="rtl"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Truck className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">
                      {form.supplier.name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground tabular-nums" dir="ltr">
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

            <div className="space-y-0.5 rounded-xl border border-border/50 bg-muted/10 p-2.5">
              {showSubtotal ? (
                <MoneyRow icon={Package} label="الإجمالي قبل الخصم" value={formatUsd(subtotal)} />
              ) : null}
              <MoneyRow
                icon={Scale}
                label="الكمية"
                value={
                  <span className="inline-flex items-baseline gap-1">
                    <span className="font-mono tabular-nums">{formatKgAmount(totalQuantity)}</span>
                    <span className="font-sans">كغ</span>
                  </span>
                }
                muted
              />
              <MoneyRow icon={BadgePercent} label="الخصم" value={formatUsd(form.discount)} muted />
              <Separator className="my-1.5" />
              <MoneyRow icon={Calculator} label="الإجمالي النهائي" value={formatUsd(total)} strong />
              <MoneyRow icon={Wallet} label="المدفوع" value={formatUsd(form.paidAmount)} />
            </div>

            <div className="space-y-1.5">
              <BalanceCallout
                icon={HandCoins}
                label="باقي هذه الفاتورة"
                value={formatUsd(remaining)}
                hint={hasRemaining ? "المبلغ غير المدفوع من هذه الفاتورة فقط" : "هذه الفاتورة مسددة بالكامل"}
                tone={hasRemaining ? "warning" : "success"}
              />

              {form.supplier ? (
                <BalanceCallout
                  icon={Wallet}
                  label="رصيد المورد بعد الاعتماد"
                  value={formatUsd(Math.abs(supplierBalanceAfterInvoice))}
                  hint={`الرصيد الحالي: ${formatUsd(Math.abs(currentSupplierBalance))} · ${supplierBalanceLabel}`}
                  tone={supplierBalanceTone}
                />
              ) : null}
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

        <div className="relative z-10 shrink-0 border-t border-border/50 bg-background p-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
          <div className="grid gap-1.5">
            <Button
              type="button"
              className="h-11 w-full rounded-xl px-4 shadow-sm"
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
              className="h-9 w-full rounded-xl gap-2"
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
              className="h-9 w-full rounded-xl gap-2"
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
