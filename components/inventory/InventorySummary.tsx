"use client"

import { AlertTriangle, Boxes, CircleDollarSign, Move3d } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import { formatInventoryMoney, type InventorySummaryResponse } from "@/src/features/inventory"

export function InventorySummary({ summary, isLoading, error, onAvailable, onReorder, onMovements }: { summary?: InventorySummaryResponse; isLoading?: boolean; error?: Error; onAvailable: () => void; onReorder: () => void; onMovements: () => void }) {
  const cards: SummaryCard[] = [
    { title: "قيمة المخزون الحالية", value: formatInventoryMoney(summary?.current_stock_value), icon: CircleDollarSign, colorKey: "primary", showPercentage: false, showProgress: false },
    { title: "أصناف متوفرة", value: summary?.available_items_count ?? 0, icon: Boxes, colorKey: "success", showPercentage: false, showProgress: false, onClick: onAvailable },
    { title: "تحتاج إعادة طلب", value: summary?.reorder_required_items_count ?? 0, icon: AlertTriangle, colorKey: "warning", showPercentage: false, showProgress: false, onClick: onReorder },
    { title: "حركات خلال الفترة", value: summary?.movements_count_in_period ?? 0, icon: Move3d, colorKey: "info", showPercentage: false, showProgress: false, onClick: onMovements },
  ]
  return <div className="space-y-2">{error ? <p className="text-center text-xs text-muted-foreground">تعذر تحميل ملخص المخزون.</p> : null}<SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} /></div>
}
