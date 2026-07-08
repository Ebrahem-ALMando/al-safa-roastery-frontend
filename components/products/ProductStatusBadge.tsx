"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ProductStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
      <CheckCircle2 className="size-3.5" />
      فعال
    </Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground hover:bg-muted">
      <XCircle className="size-3.5" />
      موقوف
    </Badge>
  )
}
