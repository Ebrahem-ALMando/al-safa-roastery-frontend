import type { ItemType } from "@/features/items/types/item.types"
import type { PurchasePaymentMethod } from "./purchase.types"

export type PurchaseEditorSupplier = {
  id: number
  name: string
  code: string | null
  phone: string | null
  current_balance: string | number | null
}

export type PurchaseEditorLine = {
  key: string
  itemId: number
  itemName: string
  itemCode: string | null
  itemType: ItemType
  quantityKg: string
  unitPrice: string
  referenceCost?: string | number | null
  highlight?: boolean
}

export type PurchaseEditorFormState = {
  supplier: PurchaseEditorSupplier | null
  invoiceDate: string
  invoiceNumber: string
  discount: string
  paidAmount: string
  paymentMethod: PurchasePaymentMethod | ""
  notes: string
  lines: PurchaseEditorLine[]
}

export type PurchaseEditorFieldErrors = Partial<
  Record<
    | "supplier_id"
    | "invoice_date"
    | "invoice_number"
    | "discount"
    | "paid_amount"
    | "payment_method"
    | "notes"
    | "lines"
    | "_form",
    string
  >
> &
  Record<string, string | undefined>

export type PurchaseEditorLineInput = {
  item_id: number
  quantity_kg: number
  unit_price: number
}

export type SavePurchaseDraftInput = {
  invoice_number?: string | null
  supplier_id: number
  invoice_date: string
  discount?: number
  paid_amount?: number
  payment_method?: PurchasePaymentMethod | null
  notes?: string | null
  lines: PurchaseEditorLineInput[]
}
