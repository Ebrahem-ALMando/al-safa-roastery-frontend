"use client";

import {
  FormFieldIcon,
  FormSection,
} from "@/components/shared/forms/FormSection";
import { Button } from "@/components/ui/button";
import {
  adminFormFieldErrorClass,
  adminFormInputClass,
  adminFormLabelClass,
} from "@/components/shared/forms/administrative-form-styles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PURCHASE_PAYMENT_METHOD_LABELS_AR,
  type PurchasePaymentMethod,
} from "@/features/purchases";
import type { PurchaseEditorFormState } from "@/features/purchases/types/purchase-editor.types";
import { cn } from "@/lib/utils";
import { Banknote, Calendar, CreditCard, FileText, Hash, Info, Wallet } from "lucide-react";

const PAYMENT_METHODS = Object.entries(PURCHASE_PAYMENT_METHOD_LABELS_AR) as [
  PurchasePaymentMethod,
  string,
][];

type PurchaseEditorInvoiceInfoProps = {
  form: PurchaseEditorFormState;
  invoiceTotal: number;
  onChange: (patch: Partial<PurchaseEditorFormState>) => void;
  fieldErrors: Record<string, string | undefined>;
  disabled?: boolean;
};

export function PurchaseEditorInvoiceInfo({
  form,
  invoiceTotal,
  onChange,
  fieldErrors,
  disabled = false,
}: PurchaseEditorInvoiceInfoProps) {
  const paidPositive = Number.parseFloat(form.paidAmount || "0") > 0;
  const normalizedTotal = Math.max(0, invoiceTotal);
  const canUsePaymentShortcuts = !disabled && normalizedTotal > 0;

  return (
    <FormSection
      icon={FileText}
      title="معلومات الفاتورة"
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 gap-2 rounded-lg"
            disabled={!canUsePaymentShortcuts}
            onClick={() =>
              onChange({
                paidAmount: normalizedTotal.toFixed(2),
                paymentMethod: form.paymentMethod || "cash",
              })
            }
          >
            <Banknote className="size-4" />
            دفع كامل الفاتورة
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-lg"
            disabled={disabled}
            onClick={() => onChange({ paidAmount: "0", paymentMethod: form.paymentMethod || "cash" })}
          >
            <Wallet className="size-4" />
            شراء آجل
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-lg text-muted-foreground"
                aria-label="تلميحات الفاتورة"
              >
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" dir="rtl" className="max-w-xs text-right leading-relaxed">
              Ctrl + Enter لاعتماد الفاتورة. حفظ كمسودة يبقي المخزون ورصيد المورد دون تغيير حتى الاعتماد.
            </TooltipContent>
          </Tooltip>
        </>
      }
    >
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
              className={cn(
                adminFormInputClass,
                fieldErrors.invoice_date && "border-destructive/60",
              )}
            />
          </div>
          {fieldErrors.invoice_date ? (
            <p className={adminFormFieldErrorClass} role="alert">
              {fieldErrors.invoice_date}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label className={adminFormLabelClass}>
            رقم فاتورة المورد الخارجية (اختياري)
          </Label>
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

        <div className="sm:col-span-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] [&>*]:min-w-0">
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
                className={cn(
                  adminFormInputClass,
                  "w-full tabular-nums",
                  fieldErrors.paid_amount && "border-destructive/60",
                )}
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
                className={cn(
                  adminFormInputClass,
                  "w-full tabular-nums",
                  fieldErrors.discount && "border-destructive/60",
                )}
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
              طريقة الدفع
              {paidPositive ? (
                <span className="text-destructive"> *</span>
              ) : null}
            </Label>
            <div className="relative">
              <FormFieldIcon>
                <CreditCard className="size-4" />
              </FormFieldIcon>
              <Select
                value={form.paymentMethod || "cash"}
                disabled={disabled}
                onValueChange={(v) =>
                  onChange({ paymentMethod: v as PurchasePaymentMethod })
                }
              >
                <SelectTrigger
                  className={cn(
                    adminFormInputClass,
                    "!w-full min-w-0 justify-between",
                    fieldErrors.payment_method && "border-destructive/60",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {PAYMENT_METHODS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {fieldErrors.payment_method ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldErrors.payment_method}
              </p>
            ) : null}
          </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
