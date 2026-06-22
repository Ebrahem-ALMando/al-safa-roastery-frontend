"use client"

import { useEffect, useState } from "react"
import { Check, CreditCard, FileText, ShoppingCart } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check as CheckIcon, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatUsd, type PurchaseSummaryResponse } from "@/features/purchases"

export interface PurchasesSummaryProps {
  summary: PurchaseSummaryResponse | null
  isLoading?: boolean
  error?: Error
}

const ZERO_USD = formatUsd(0)

function formatKpiMoney(value: string | number | null | undefined): string {
  if (value == null) return ZERO_USD
  if (typeof value === "string" && value.trim() !== "") return formatUsd(value)
  const n = typeof value === "number" ? value : Number.parseFloat(String(value))
  if (Number.isFinite(n)) return formatUsd(n)
  return ZERO_USD
}

export function PurchasesSummary({ summary, isLoading = false, error }: PurchasesSummaryProps) {
  const [selectedThemeId, setSelectedThemeId] = useState("default")
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("purchases-summary-theme")
    if (saved) setSelectedThemeId(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("purchases-summary-theme", selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)
  const completedCount = summary?.completed_invoices_count ?? 0
  const totalPurchases = formatKpiMoney(summary?.total_purchases)
  const totalPaid = formatKpiMoney(summary?.total_paid)
  const totalRemaining = formatKpiMoney(summary?.total_remaining)

  const cards: SummaryCard[] = [
    {
      title: "إجمالي المشتريات",
      value: totalPurchases,
      icon: ShoppingCart,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "فواتير مكتملة",
      value: completedCount,
      icon: FileText,
      colorKey: "info",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "إجمالي المدفوع",
      value: totalPaid,
      icon: CreditCard,
      colorKey: "success",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "إجمالي المتبقي",
      value: totalRemaining,
      icon: Check,
      colorKey: "warning",
      showPercentage: false,
      showProgress: false,
    },
  ]

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          تعذر تحميل بعض إحصائيات المشتريات.
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
