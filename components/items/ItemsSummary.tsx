"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Boxes, Package, Palette, Wheat } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check as CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ItemSummaryResponse } from "@/features/items"

export interface ItemsSummaryProps {
  summary: ItemSummaryResponse | null
  isLoading?: boolean
  error?: Error
}

export function ItemsSummary({ summary, isLoading = false, error }: ItemsSummaryProps) {
  const [selectedThemeId, setSelectedThemeId] = useState("default")
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("items-summary-theme")
    if (saved) setSelectedThemeId(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("items-summary-theme", selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)

  const activeCount = summary?.active_items_count ?? 0
  const rawCount = summary?.raw_items_count ?? 0
  const readyCount = summary?.ready_items_count ?? 0
  const reorderCount = summary?.reorder_required_count ?? 0

  const cards: SummaryCard[] = [
    {
      title: "الأصناف النشطة",
      value: activeCount,
      icon: Boxes,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "أصناف خام",
      value: rawCount,
      icon: Wheat,
      colorKey: "warning",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "أصناف جاهزة",
      value: readyCount,
      icon: Package,
      colorKey: "info",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "تحتاج إعادة طلب",
      value: reorderCount,
      icon: AlertTriangle,
      colorKey: "success",
      showPercentage: false,
      showProgress: false,
    },
  ]

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          تعذر تحميل بعض إحصائيات الأصناف.
        </p>
      ) : null}
      <div className="flex items-center justify-end">
        <Popover open={themeOpen} onOpenChange={setThemeOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/10">
              <Palette className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">تغيير الثيم</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4">
            <div className="space-y-3">
              <div className="mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <p className="font-semibold">اختر ثيم البطاقات</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {summaryCardsThemes.map((theme) => {
                  const selected = theme.id === selectedThemeId
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedThemeId(theme.id)
                        setThemeOpen(false)
                      }}
                      className={cn(
                        "relative rounded-xl border-2 p-3 text-right transition-all duration-200 hover:scale-[1.02]",
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      )}
                    >
                      {selected ? (
                        <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                      ) : null}
                      <p className="text-sm font-medium">{theme.name}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <SummaryCards cards={cards} isLoading={isLoading} theme={currentTheme} />
    </div>
  )
}
