"use client"

import { Badge } from "@/components/ui/badge"
import { getItemTypeLabel, type ItemType } from "@/features/items"

type ItemTypeBadgeProps = {
  itemType: ItemType
}

export function ItemTypeBadge({ itemType }: ItemTypeBadgeProps) {
  const label = getItemTypeLabel(itemType)
  const className =
    itemType === "raw"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
      : "border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-200"

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
