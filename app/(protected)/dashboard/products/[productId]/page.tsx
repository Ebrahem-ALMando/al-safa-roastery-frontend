import { ProductDetailsView } from "@/components/products/ProductDetailsView"

type ProductDetailsPageProps = {
  params: Promise<{ productId: string }>
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { productId } = await params
  const id = Number.parseInt(productId, 10)

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="p-6 text-center text-destructive" dir="rtl">
        معرّف المنتج غير صالح.
      </div>
    )
  }

  return <ProductDetailsView productId={id} />
}
