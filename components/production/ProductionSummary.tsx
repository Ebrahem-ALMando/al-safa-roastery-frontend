"use client"

import { useEffect, useState } from "react"
import { Check, CircleCheckBig, CircleDollarSign, Factory, Palette, Scale } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatProductionMoney, formatProductionQuantity, type ProductionSummaryResponse } from "@/src/features/production"

export function ProductionSummary({ summary, isLoading, error, onAll, onCompleted }: { summary: ProductionSummaryResponse | null; isLoading?: boolean; error?: Error; onAll?: () => void; onCompleted?: () => void }) {
  const [themeId, setThemeId] = useState(() => typeof window === "undefined" ? "default" : localStorage.getItem("production-summary-theme") ?? "default")
  const [open, setOpen] = useState(false)
  useEffect(() => { localStorage.setItem("production-summary-theme", themeId) }, [themeId])
  const cards: SummaryCard[] = [
    { title: "عمليات الإنتاج", value: summary?.production_batches_count ?? 0, icon: Factory, colorKey: "primary", showPercentage: false, showProgress: false, onClick: onAll },
    { title: "الإنتاج المكتمل", value: summary?.completed_batches_count ?? 0, icon: CircleCheckBig, colorKey: "success", showPercentage: false, showProgress: false, onClick: onCompleted },
    { title: "إجمالي الكمية المنتجة", value: formatProductionQuantity(summary?.total_output_quantity_kg), icon: Scale, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "تكلفة المواد الداخلة", value: formatProductionMoney(summary?.total_input_cost), icon: CircleDollarSign, colorKey: "warning", showPercentage: false, showProgress: false },
  ]
  return (
    <div className="space-y-4">
      {error ? <p className="text-center text-xs text-muted-foreground">تعذر تحميل بعض إحصائيات الإنتاج.</p> : null}
      <div className="flex justify-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild><Button variant="outline" size="sm" className="gap-2 border-primary/20"><Palette className="size-4 text-primary" />تغيير الثيم</Button></PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4">
            <p className="mb-3 font-semibold">اختر ثيم البطاقات</p>
            <div className="grid grid-cols-2 gap-3">
              {summaryCardsThemes.map((theme) => <button key={theme.id} type="button" className={cn("relative rounded-lg border-2 p-3 text-right", theme.id === themeId ? "border-primary bg-primary/5" : "border-border")} onClick={() => { setThemeId(theme.id); setOpen(false) }}>{theme.id === themeId ? <Check className="absolute left-2 top-2 size-4 text-primary" /> : null}<span className="text-sm">{theme.name}</span></button>)}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById(themeId)} />
    </div>
  )
}
