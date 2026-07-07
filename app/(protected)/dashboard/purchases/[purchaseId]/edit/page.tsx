import { PurchaseInvoiceEditor } from "@/components/purchases/editor/PurchaseInvoiceEditor"

type EditPurchasePageProps = {
  params: Promise<{ purchaseId: string }>
}

export default async function EditPurchasePage({ params }: EditPurchasePageProps) {
  const { purchaseId } = await params
  const id = Number.parseInt(purchaseId, 10)

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="p-6 text-center text-destructive" dir="rtl">
        معرف الفاتورة غير صالح.
      </div>
    )
  }

  return <PurchaseInvoiceEditor mode="edit" purchaseId={id} />
}
