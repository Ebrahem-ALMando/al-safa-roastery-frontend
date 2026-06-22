"use client"

import { ArrowDownLeft, ArrowUpRight, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  formatBalanceAmount,
  getBalanceBadgeClass,
  getBalanceStatusLabel,
} from "@/features/customers"

export function CustomerBalanceBadge({
  balance,
  showAmount = true,
}: {
  balance: string | number | null | undefined
  showAmount?: boolean
}) {
  const info = getBalanceStatusLabel(balance)
  const Icon =
    info.key === "receivable" ? ArrowDownLeft : info.key === "credit" ? ArrowUpRight : Minus

  return (
    <div className="flex flex-col items-center gap-1">
      {showAmount ? (
        <p className="text-sm font-semibold" dir="ltr">
          {formatBalanceAmount(balance)}
        </p>
      ) : null}
      <Badge variant="outline" className={`gap-1 text-xs font-medium ${getBalanceBadgeClass(info.key)}`}>
        <Icon className="size-3.5" />
        {info.label}
      </Badge>
    </div>
  )
}
