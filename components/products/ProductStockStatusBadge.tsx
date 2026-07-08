"use client"

import { PackageCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  getProductStockBadgeClass,
  getProductStockStatus,
  getProductStockStatusLabel,
  type Product,
  type ProductStockStatus,
} from "@/features/products"

type Props = {
  product?: Product
  status?: ProductStockStatus | null
}

export function ProductStockStatusBadge({ product, status }: Props) {
  const resolved = status ?? (product ? getProductStockStatus(product) : "unlinked")
  return (
    <Badge variant="outline" className={getProductStockBadgeClass(resolved)}>
      <PackageCheck className="size-3.5" />
      {getProductStockStatusLabel(resolved)}
    </Badge>
  )
}
