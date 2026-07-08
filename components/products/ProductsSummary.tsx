"use client"

import { AlertTriangle, CircleDollarSign, PackageCheck, Tags } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import type { ProductSummaryResponse } from "@/features/products"

type ProductsSummaryProps = {
  summary: ProductSummaryResponse | null
  isLoading?: boolean
  error?: Error
  onActiveClick?: () => void
  onPricedClick?: () => void
  onUnpricedClick?: () => void
  onReorderClick?: () => void
}

export function ProductsSummary({
  summary,
  isLoading = false,
  error,
  onActiveClick,
  onPricedClick,
  onUnpricedClick,
  onReorderClick,
}: ProductsSummaryProps) {
  const cards: SummaryCard[] = [
    {
      title: "المنتجات النشطة",
      value: summary?.active_products_count ?? 0,
      icon: PackageCheck,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
      onClick: onActiveClick,
    },
    {
      title: "المنتجات المسعّرة",
      value: summary?.priced_products_count ?? 0,
      icon: CircleDollarSign,
      colorKey: "success",
      showPercentage: false,
      showProgress: false,
      onClick: onPricedClick,
    },
    {
      title: "منتجات بدون سعر",
      value: summary?.unpriced_products_count ?? 0,
      icon: Tags,
      colorKey: "warning",
      showPercentage: false,
      showProgress: false,
      onClick: onUnpricedClick,
    },
    {
      title: "منتجات تحتاج إعادة طلب",
      value: summary?.reorder_required_products_count ?? 0,
      icon: AlertTriangle,
      colorKey: "info",
      showPercentage: false,
      showProgress: false,
      onClick: onReorderClick,
    },
  ]

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          تعذر تحميل بعض إحصائيات المنتجات.
        </p>
      ) : null}
      <SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} />
    </div>
  )
}
