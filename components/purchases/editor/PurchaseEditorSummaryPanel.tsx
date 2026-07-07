"use client"

import { Receipt } from "lucide-react"
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

function SummaryRow({
  label,
  value,
  prominent,
  muted,
}: {
  label: string
  value: string
  prominent?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("text-sm", muted ? "text-muted-foreground" : "font-medium")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          prominent ? "text-lg font-bold text-foreground" : "text-sm font-semibold"
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

  return (
    <Card className="border-border/60 shadow-md lg:sticky lg:top-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="size-5 text-primary" />
          ملخص الفاتورة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SummaryRow label="إجمالي الأصناف" value={formatUsd(subtotal)} />
        <SummaryRow label="الخصم" value={formatUsd(form.discount)} muted />
        <Separator />
        <SummaryRow label="الإجمالي النهائي" value={formatUsd(total)} prominent />
        <SummaryRow label="المدفوع" value={formatUsd(form.paidAmount)} />
        <SummaryRow label="المتبقي للمورد" value={formatUsd(remaining)} prominent />
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
