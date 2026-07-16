import { Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getCustomerTypePresentation } from "@/features/customers"
import { cn } from "@/lib/utils"
import type { StatementParty } from "@/src/features/statements"

export function StatementPartyBadge({ party }: { party: StatementParty }) {
  if (party.type === "supplier") {
    return (
      <Badge
        variant="outline"
        className="gap-1 rounded-full border-primary/30 bg-primary/10 px-2.5 py-1 text-primary"
      >
        <Truck className="size-3 text-primary" aria-hidden />
        مورد
      </Badge>
    )
  }

  if (!party.customer_type) return null

  const presentation = getCustomerTypePresentation(party.customer_type)
  const Icon = presentation.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full border-2 px-2.5 py-1",
        presentation.selectedClass
      )}
    >
      <Icon className={cn("size-3", presentation.iconSelectedClass)} aria-hidden />
      {presentation.label}
    </Badge>
  )
}
