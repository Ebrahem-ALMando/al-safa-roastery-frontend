import { ProductionDetailsView } from "@/components/production/ProductionDetailsView"

export default async function ProductionDetailsPage({ params }: { params: Promise<{ productionId: string }> }) {
  const { productionId } = await params
  const id = Number.parseInt(productionId, 10)
  return Number.isFinite(id) && id > 0
    ? <ProductionDetailsView productionId={id} />
    : <div className="p-6 text-center text-destructive" dir="rtl">معرّف عملية الإنتاج غير صالح.</div>
}
