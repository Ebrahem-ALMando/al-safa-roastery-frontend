"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Check, CircleDollarSign, PackageCheck, Palette, Tags } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ProductSummaryResponse } from "@/features/products"

type ProductsSummaryProps = {
  summary: ProductSummaryResponse | null
  isLoading?: boolean
  error?: Error
  onActiveClick?: () => void
  onPricedClick?: () => void
  onUnpricedClick?: () => void
  onReorderClick?: () => void
}

export function ProductsSummary({
  summary,
  isLoading = false,
  error,
  onActiveClick,
  onPricedClick,
  onUnpricedClick,
  onReorderClick,
}: ProductsSummaryProps) {
  const [selectedThemeId, setSelectedThemeId] = useState(() => {
    if (typeof window === "undefined") return "default"
    return localStorage.getItem("products-summary-theme") ?? "default"
  })
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem("products-summary-theme", selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)

  const cards: SummaryCard[] = [
    {
      title: "المنتجات النشطة",
      value: summary?.active_products_count ?? 0,
      icon: PackageCheck,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
      onClick: onActiveClick,
    },
    {
      title: "المنتجات المسعّرة",
      value: summary?.priced_products_count ?? 0,
      icon: CircleDollarSign,
      colorKey: "success",
      showPercentage: false,
      showProgress: false,
      onClick: onPricedClick,
    },
    {
      title: "منتجات بدون سعر",
      value: summary?.unpriced_products_count ?? 0,
      icon: Tags,
      colorKey: "warning",
      showPercentage: false,
      showProgress: false,
      onClick: onUnpricedClick,
    },
    {
      title: "منتجات تحتاج إعادة طلب",
      value: summary?.reorder_required_products_count ?? 0,
      icon: AlertTriangle,
      colorKey: "info",
      showPercentage: false,
      showProgress: false,
      onClick: onReorderClick,
    },
  ]

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          تعذر تحميل بعض إحصائيات المنتجات.
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
                          <Check className="h-3 w-3" />
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
