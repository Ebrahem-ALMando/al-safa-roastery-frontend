import { ApiRequestError } from "@/lib/api"
import type { PurchaseEditorFieldErrors, PurchaseEditorFormState } from "../types/purchase-editor.types"
import { calculateSubtotal, calculateTotal } from "./purchase-editor.helpers"
import { parseNumericAmount } from "./purchases.helpers"

const SERVER_FIELD_MESSAGES: Record<string, string> = {
  "Discount cannot exceed subtotal.": "الخصم لا يمكن أن يتجاوز إجمالي الأصناف.",
  "Paid amount cannot exceed invoice total.": "المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي النهائي.",
  "Payment method is required when paid amount is greater than zero.":
    "طريقة الدفع مطلوبة عند وجود مبلغ مدفوع.",
  "Each item can only appear once on the invoice.": "لا يمكن إضافة نفس الصنف أكثر من مرة.",
}

function mapServerMessage(message: string): string {
  return SERVER_FIELD_MESSAGES[message] ?? "تحقق من صحة البيانات المدخلة."
}

export function mapPurchaseEditorApiErrors(err: unknown): PurchaseEditorFieldErrors {
  if (!(err instanceof ApiRequestError) || !err.errors) {
    return { _form: "تعذر تنفيذ العملية. حاول مجدداً." }
  }

  const result: PurchaseEditorFieldErrors = {}
  for (const [field, messages] of Object.entries(err.errors)) {
    const first = messages?.[0]
    if (first) {
      result[field] = mapServerMessage(first)
    }
  }
  return result
}

export function validatePurchaseEditorForm(form: PurchaseEditorFormState): PurchaseEditorFieldErrors {
  const errors: PurchaseEditorFieldErrors = {}

  if (!form.supplier) {
    errors.supplier_id = "يجب اختيار المورد."
  }

  if (!form.invoiceDate.trim()) {
    errors.invoice_date = "تاريخ الفاتورة مطلوب."
  }

  if (form.lines.length === 0) {
    errors.lines = "يجب إضافة صنف واحد على الأقل."
  }

  const itemIds = new Set<number>()
  for (let i = 0; i < form.lines.length; i++) {
    const line = form.lines[i]
    const qty = parseNumericAmount(line.quantityKg)
    const price = parseNumericAmount(line.unitPrice)

    if (itemIds.has(line.itemId)) {
      errors.lines = "لا يمكن إضافة نفس الصنف أكثر من مرة."
      break
    }
    itemIds.add(line.itemId)

    if (!Number.isFinite(qty) || qty <= 0) {
      errors[`lines.${i}.quantity_kg`] = "الكمية يجب أن تكون أكبر من صفر."
    }
    if (!Number.isFinite(price) || price < 0) {
      errors[`lines.${i}.unit_price`] = "سعر الكيلو غير صالح."
    }
  }

  const subtotal = calculateSubtotal(form.lines)
  const discount = parseNumericAmount(form.discount)
  const total = calculateTotal(subtotal, form.discount)
  const paid = parseNumericAmount(form.paidAmount)

  if (discount < 0) {
    errors.discount = "الخصم غير صالح."
  } else if (discount > subtotal) {
    errors.discount = "الخصم لا يمكن أن يتجاوز إجمالي الأصناف."
  }

  if (paid < 0) {
    errors.paid_amount = "المبلغ المدفوع غير صالح."
  } else if (paid > total) {
    errors.paid_amount = "المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي النهائي."
  }

  if (paid > 0 && !form.paymentMethod) {
    errors.payment_method = "طريقة الدفع مطلوبة عند وجود مبلغ مدفوع."
  }

  return errors
}

export function hasPurchaseEditorErrors(errors: PurchaseEditorFieldErrors): boolean {
  return Object.values(errors).some((v) => Boolean(v))
}
