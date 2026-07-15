"use client"

import { ArrowDownToLine, ArrowUpFromLine, ListChecks, SlidersHorizontal } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import { formatInventoryQuantity, type InventoryMovementSummaryResponse } from "@/src/features/inventory"

export function InventoryMovementsSummary({ summary, isLoading, error }: { summary?: InventoryMovementSummaryResponse; isLoading?: boolean; error?: Error }) {
  const cards: SummaryCard[] = [
    { title: "إجمالي الحركات", value: summary?.movements_count ?? 0, icon: ListChecks, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "الوارد خلال الفترة", value: formatInventoryQuantity(summary?.incoming_quantity_kg), icon: ArrowDownToLine, colorKey: "success", showPercentage: false, showProgress: false },
    { title: "الصادر خلال الفترة", value: formatInventoryQuantity(summary?.outgoing_quantity_kg), icon: ArrowUpFromLine, colorKey: "danger", showPercentage: false, showProgress: false },
    { title: "حركات التسوية", value: summary?.adjustments_count ?? 0, icon: SlidersHorizontal, colorKey: "warning", showPercentage: false, showProgress: false },
  ]
  return <div className="space-y-2">{error ? <p className="text-center text-xs text-muted-foreground">تعذر تحميل ملخص حركات المخزون.</p> : null}<SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} /></div>
}
