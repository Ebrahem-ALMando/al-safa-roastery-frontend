"use client"

import { Badge } from "@/components/ui/badge"
import { getItemStockStatus, getStockBadgeClass, getStockStatusLabel, type Item } from "@/features/items"

type ItemStockBadgeProps = {
  item: Pick<Item, "current_quantity_kg" | "minimum_quantity_kg">
}

export function ItemStockBadge({ item }: ItemStockBadgeProps) {
  const status = getItemStockStatus(item)
  return (
    <Badge variant="outline" className={getStockBadgeClass(status)}>
      {getStockStatusLabel(status)}
    </Badge>
  )
}
