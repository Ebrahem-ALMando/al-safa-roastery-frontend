"use client"

import { Package, Wheat } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getItemTypeLabel, type ItemType } from "@/features/items"

type ItemTypeBadgeProps = {
  itemType: ItemType
}

export function ItemTypeBadge({ itemType }: ItemTypeBadgeProps) {
  const label = getItemTypeLabel(itemType)
  const Icon = itemType === "raw" ? Wheat : Package
  const className =
    itemType === "raw"
      ? "gap-1 border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
      : "gap-1 border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-200"
  const iconClassName =
    itemType === "raw"
      ? "size-3.5 text-amber-600 dark:text-amber-300"
      : "size-3.5 text-sky-600 dark:text-sky-300"

  return (
    <Badge variant="outline" className={className}>
      <Icon className={iconClassName} aria-hidden />
      {label}
    </Badge>
  )
}
