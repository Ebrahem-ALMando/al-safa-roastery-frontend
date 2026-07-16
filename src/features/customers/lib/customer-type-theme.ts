import { Car, CircleUserRound, Package, ShoppingBag } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { CustomerType } from "../types/customer.types"
import { CUSTOMER_TYPE_LABELS_AR } from "./customers.constants"

export type CustomerTypePresentation = {
  value: CustomerType
  label: string
  icon: LucideIcon
  selectedClass: string
  idleClass: string
  iconSelectedClass: string
  iconIdleClass: string
  focusRingClass: string
}

export const CUSTOMER_TYPE_OPTIONS: CustomerTypePresentation[] = [
  {
    value: "consumer",
    label: CUSTOMER_TYPE_LABELS_AR.consumer,
    icon: CircleUserRound,
    selectedClass:
      "border-emerald-500 bg-emerald-500/12 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-emerald-400/45 hover:bg-emerald-500/5",
    iconSelectedClass: "text-emerald-600 dark:text-emerald-300",
    iconIdleClass: "text-emerald-600/80",
    focusRingClass: "focus-visible:ring-emerald-500/40",
  },
  {
    value: "retail",
    label: CUSTOMER_TYPE_LABELS_AR.retail,
    icon: ShoppingBag,
    selectedClass:
      "border-sky-500 bg-sky-500/12 text-sky-900 dark:border-sky-400 dark:bg-sky-500/15 dark:text-sky-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-sky-400/45 hover:bg-sky-500/5",
    iconSelectedClass: "text-sky-600 dark:text-sky-300",
    iconIdleClass: "text-sky-600/80",
    focusRingClass: "focus-visible:ring-sky-500/40",
  },
  {
    value: "wholesale",
    label: CUSTOMER_TYPE_LABELS_AR.wholesale,
    icon: Package,
    selectedClass:
      "border-violet-500 bg-violet-500/12 text-violet-950 dark:border-violet-400 dark:bg-violet-500/15 dark:text-violet-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-violet-400/45 hover:bg-violet-500/5",
    iconSelectedClass: "text-violet-600 dark:text-violet-300",
    iconIdleClass: "text-violet-600/80",
    focusRingClass: "focus-visible:ring-violet-500/40",
  },
  {
    value: "car",
    label: CUSTOMER_TYPE_LABELS_AR.car,
    icon: Car,
    selectedClass:
      "border-amber-500 bg-amber-500/12 text-amber-950 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-amber-400/45 hover:bg-amber-500/5",
    iconSelectedClass: "text-amber-600 dark:text-amber-300",
    iconIdleClass: "text-amber-600/80",
    focusRingClass: "focus-visible:ring-amber-500/40",
  },
]

const CUSTOMER_TYPE_PRESENTATIONS = Object.fromEntries(
  CUSTOMER_TYPE_OPTIONS.map((option) => [option.value, option])
) as Record<CustomerType, CustomerTypePresentation>

export function getCustomerTypePresentation(type: CustomerType): CustomerTypePresentation {
  return CUSTOMER_TYPE_PRESENTATIONS[type]
}
