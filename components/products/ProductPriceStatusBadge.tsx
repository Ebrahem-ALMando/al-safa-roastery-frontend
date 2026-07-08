"use client"

import { BadgeCheck, CircleDollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getProductPriceStatusLabel, type ProductPriceStatus } from "@/features/products"

export function ProductPriceStatusBadge({ status }: { status: ProductPriceStatus | null | undefined }) {
  const priced = status === "priced"
  return (
    <Badge
      variant="outline"
      className={
        priced
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300"
      }
    >
      {priced ? <BadgeCheck className="size-3.5" /> : <CircleDollarSign className="size-3.5" />}
      {getProductPriceStatusLabel(status)}
    </Badge>
  )
}
