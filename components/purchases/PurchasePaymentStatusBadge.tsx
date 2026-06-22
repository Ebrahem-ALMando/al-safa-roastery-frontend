"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getPurchasePaymentStatusBadgeClass,
  getPurchasePaymentStatusLabel,
  type PurchasePaymentStatus,
} from "@/features/purchases"

type Props = {
  status: PurchasePaymentStatus
  className?: string
}

export function PurchasePaymentStatusBadge({ status, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", getPurchasePaymentStatusBadgeClass(status), className)}
    >
      {getPurchasePaymentStatusLabel(status)}
    </Badge>
  )
}
