"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getProductionStatusClass, getProductionStatusLabel, type ProductionStatus } from "@/src/features/production"

export function ProductionStatusBadge({ status, className }: { status: ProductionStatus; className?: string }) {
  return <Badge variant="outline" className={cn("font-medium", getProductionStatusClass(status), className)}>{getProductionStatusLabel(status)}</Badge>
}
