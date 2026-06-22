"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getPurchaseStatusBadgeClass,
  getPurchaseStatusLabel,
  type PurchaseInvoiceStatus,
} from "@/features/purchases"

type Props = {
  status: PurchaseInvoiceStatus
  className?: string
}

export function PurchaseStatusBadge({ status, className }: Props) {
  return (
    <Badge variant="outline" className={cn("font-medium", getPurchaseStatusBadgeClass(status), className)}>
      {getPurchaseStatusLabel(status)}
    </Badge>
  )
}
