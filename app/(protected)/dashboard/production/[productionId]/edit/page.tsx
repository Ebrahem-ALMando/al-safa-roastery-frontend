import { ProductionEditor } from "@/components/production/editor/ProductionEditor"

export default async function EditProductionPage({ params }: { params: Promise<{ productionId: string }> }) {
  const { productionId } = await params
  const id = Number.parseInt(productionId, 10)
  return Number.isFinite(id) && id > 0 ? <ProductionEditor mode="edit" productionId={id} /> : <div className="p-6 text-center text-destructive" dir="rtl">معرّف عملية الإنتاج غير صالح.</div>
}
