import { InventoryItemDetailsView } from "@/components/inventory/InventoryItemDetailsView"
export default async function InventoryItemPage({ params }: { params: Promise<{ itemId: string }> }) { const { itemId } = await params; const id = Number.parseInt(itemId, 10); return Number.isFinite(id) && id > 0 ? <InventoryItemDetailsView itemId={id} /> : <div dir="rtl">معرّف الصنف غير صالح.</div> }
