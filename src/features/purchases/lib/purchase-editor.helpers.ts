import { formatLocalYmd } from "@/lib/date-scope/resolve-operational-date-range"
import type { Item } from "@/features/items/types/item.types"
import type { PurchaseInvoice, PurchasePaymentMethod } from "../types/purchase.types"
import type {
  PurchaseEditorFormState,
  PurchaseEditorLine,
  PurchaseEditorLineInput,
  PurchaseEditorSupplier,
  SavePurchaseDraftInput,
} from "../types/purchase-editor.types"
import { parseNumericAmount } from "./purchases.helpers"

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateLineTotal(quantityKg: string, unitPrice: string): number {
  const qty = parseNumericAmount(quantityKg)
  const price = parseNumericAmount(unitPrice)
  if (qty <= 0 || price < 0) return 0
  return roundMoney(qty * price)
}

export function calculateSubtotal(lines: Pick<PurchaseEditorLine, "quantityKg" | "unitPrice">[]): number {
  return roundMoney(
    lines.reduce((sum, line) => sum + calculateLineTotal(line.quantityKg, line.unitPrice), 0)
  )
}

export function calculateTotal(subtotal: number, discount: string | number): number {
  const d = parseNumericAmount(discount)
  return roundMoney(Math.max(0, subtotal - d))
}

export function calculateRemaining(total: number, paidAmount: string | number): number {
  const paid = parseNumericAmount(paidAmount)
  return roundMoney(Math.max(0, total - paid))
}

export function emptyPurchaseEditorForm(): PurchaseEditorFormState {
  return {
    supplier: null,
    invoiceDate: formatLocalYmd(new Date()),
    invoiceNumber: "",
    discount: "0",
    paidAmount: "0",
    paymentMethod: "cash",
    notes: "",
    lines: [],
  }
}

export function mapItemToEditorLine(item: Item): Omit<PurchaseEditorLine, "key" | "quantityKg" | "unitPrice"> {
  return {
    itemId: item.id,
    itemName: item.name,
    itemCode: item.code,
    itemType: item.item_type,
  }
}

export function createEditorLineFromItem(item: Item): PurchaseEditorLine {
  const avg = parseNumericAmount(item.average_cost)
  return {
    key: crypto.randomUUID(),
    ...mapItemToEditorLine(item),
    quantityKg: "",
    unitPrice: avg > 0 ? String(avg) : "",
  }
}

export function purchaseToEditorForm(purchase: PurchaseInvoice): PurchaseEditorFormState {
  const supplier: PurchaseEditorSupplier | null = purchase.supplier
    ? {
        id: purchase.supplier.id,
        name: purchase.supplier.name,
        code: purchase.supplier.code,
        phone: null,
        current_balance: purchase.supplier.current_balance ?? null,
      }
    : purchase.supplier_id
      ? {
          id: purchase.supplier_id,
          name: `مورد #${purchase.supplier_id}`,
          code: null,
          phone: null,
          current_balance: null,
        }
      : null

  return {
    supplier,
    invoiceDate: purchase.invoice_date,
    invoiceNumber: purchase.invoice_number ?? "",
    discount: String(parseNumericAmount(purchase.discount)),
    paidAmount: String(parseNumericAmount(purchase.paid_amount)),
    paymentMethod: purchase.payment_method ?? "cash",
    notes: purchase.notes ?? "",
    lines: (purchase.lines ?? []).map((line) => ({
      key: `line-${line.id}`,
      itemId: line.item_id,
      itemName: line.item?.name ?? `صنف #${line.item_id}`,
      itemCode: line.item?.code ?? null,
      itemType: (line.item?.item_type as PurchaseEditorLine["itemType"]) ?? "raw",
      quantityKg: String(parseNumericAmount(line.quantity_kg)),
      unitPrice: String(parseNumericAmount(line.unit_price)),
    })),
  }
}

export function formToSavePayload(form: PurchaseEditorFormState): SavePurchaseDraftInput {
  const payload: SavePurchaseDraftInput = {
    supplier_id: form.supplier!.id,
    invoice_date: form.invoiceDate,
    discount: parseNumericAmount(form.discount),
    paid_amount: parseNumericAmount(form.paidAmount),
    payment_method:
      parseNumericAmount(form.paidAmount) > 0
        ? (form.paymentMethod as PurchasePaymentMethod)
        : null,
    notes: form.notes.trim() || null,
    lines: form.lines.map(
      (line): PurchaseEditorLineInput => ({
        item_id: line.itemId,
        quantity_kg: parseNumericAmount(line.quantityKg),
        unit_price: parseNumericAmount(line.unitPrice),
      })
    ),
  }

  const invoiceNumber = form.invoiceNumber.trim()
  if (invoiceNumber) {
    payload.invoice_number = invoiceNumber
  }

  return payload
}

export function formsEqual(a: PurchaseEditorFormState, b: PurchaseEditorFormState): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
