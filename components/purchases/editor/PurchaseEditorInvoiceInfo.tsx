"use client"

import { Calendar, FileText, Hash, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormSection, FormFieldIcon } from "@/components/shared/forms/FormSection"
import {
  adminFormFieldErrorClass,
  adminFormInputClass,
  adminFormLabelClass,
} from "@/components/shared/forms/administrative-form-styles"
import { cn } from "@/lib/utils"
import {
  PURCHASE_PAYMENT_METHOD_LABELS_AR,
  type PurchasePaymentMethod,
} from "@/features/purchases"
import type { PurchaseEditorFormState } from "@/features/purchases/types/purchase-editor.types"

const PAYMENT_METHODS = Object.entries(PURCHASE_PAYMENT_METHOD_LABELS_AR) as [
  PurchasePaymentMethod,
  string,
][]

type PurchaseEditorInvoiceInfoProps = {
  form: PurchaseEditorFormState
  onChange: (patch: Partial<PurchaseEditorFormState>) => void
  fieldErrors: Record<string, string | undefined>
  disabled?: boolean
}

export function PurchaseEditorInvoiceInfo({
  form,
  onChange,
  fieldErrors,
  disabled = false,
}: PurchaseEditorInvoiceInfoProps) {
  const paidPositive = Number.parseFloat(form.paidAmount || "0") > 0

  return (
    <FormSection icon={FileText} title="معلومات الفاتورة">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className={adminFormLabelClass}>
            تاريخ الفاتورة <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <FormFieldIcon>
              <Calendar className="size-4" />
            </FormFieldIcon>
            <Input
              type="date"
              value={form.invoiceDate}
              disabled={disabled}
              onChange={(e) => onChange({ invoiceDate: e.target.value })}
              className={cn(adminFormInputClass, fieldErrors.invoice_date && "border-destructive/60")}
            />
          </div>
          {fieldErrors.invoice_date ? (
            <p className={adminFormFieldErrorClass} role="alert">
              {fieldErrors.invoice_date}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label className={adminFormLabelClass}>رقم فاتورة المورد الخارجية (اختياري)</Label>
          <div className="relative">
            <FormFieldIcon>
              <Hash className="size-4" />
            </FormFieldIcon>
            <Input
              value={form.invoiceNumber}
              disabled={disabled}
              onChange={(e) => onChange({ invoiceNumber: e.target.value })}
              placeholder="مثال: رقم الفاتورة المطبوعة من المورد"
              className={adminFormInputClass}
            />
          </div>
          {fieldErrors.invoice_number ? (
            <p className={adminFormFieldErrorClass} role="alert">
              {fieldErrors.invoice_number}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:col-span-2 md:grid-cols-3">
          <div className="w-full space-y-1.5">
            <Label className={adminFormLabelClass}>المبلغ المدفوع</Label>
            <div className="relative">
              <FormFieldIcon>
                <Wallet className="size-4" />
              </FormFieldIcon>
              <Input
                inputMode="decimal"
                value={form.paidAmount}
                disabled={disabled}
                onChange={(e) => onChange({ paidAmount: e.target.value })}
                className={cn(adminFormInputClass, "w-full tabular-nums", fieldErrors.paid_amount && "border-destructive/60")}
                dir="ltr"
              />
            </div>
            {fieldErrors.paid_amount ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldErrors.paid_amount}
              </p>
            ) : null}
          </div>

          <div className="w-full space-y-1.5">
            <Label className={adminFormLabelClass}>الخصم</Label>
            <div className="relative">
              <FormFieldIcon>
                <Wallet className="size-4" />
              </FormFieldIcon>
              <Input
                inputMode="decimal"
                value={form.discount}
                disabled={disabled}
                onChange={(e) => onChange({ discount: e.target.value })}
                className={cn(adminFormInputClass, "w-full tabular-nums", fieldErrors.discount && "border-destructive/60")}
                dir="ltr"
              />
            </div>
            {fieldErrors.discount ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldErrors.discount}
              </p>
            ) : null}
          </div>

          <div className="w-full space-y-1.5">
            <Label className={adminFormLabelClass}>
              طريقة الدفع{paidPositive ? <span className="text-destructive"> *</span> : null}
            </Label>
            <Select
              value={form.paymentMethod || "none"}
              disabled={disabled || !paidPositive}
              onValueChange={(v) =>
                onChange({ paymentMethod: v === "none" ? "" : (v as PurchasePaymentMethod) })
              }
            >
              <SelectTrigger
                className={cn("h-11 w-full rounded-lg", fieldErrors.payment_method && "border-destructive/60")}
              >
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="none">—</SelectItem>
                {PAYMENT_METHODS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.payment_method ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldErrors.payment_method}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </FormSection>
  )
}
