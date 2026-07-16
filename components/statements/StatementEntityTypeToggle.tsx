"use client"

import { Truck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { StatementEntityType } from "@/src/features/statements"

export function StatementEntityTypeToggle({ value, onChange }: { value: StatementEntityType; onChange: (value: StatementEntityType) => void }) {
  return <div className="flex rounded-xl border bg-muted/20 p-1" dir="rtl">
    <Button type="button" size="sm" variant={value === "customer" ? "default" : "ghost"} className={cn("flex-1 gap-2 rounded-lg", value === "customer" && "shadow-sm")} onClick={() => onChange("customer")}><Users className="size-4" />زبون</Button>
    <Button type="button" size="sm" variant={value === "supplier" ? "default" : "ghost"} className={cn("flex-1 gap-2 rounded-lg", value === "supplier" && "shadow-sm")} onClick={() => onChange("supplier")}><Truck className="size-4" />مورد</Button>
  </div>
}
