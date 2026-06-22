"use client"

import { useEffect, useState } from "react"
import { Check, CreditCard, ShoppingCart, Users } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check as CheckIcon, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { useCustomerSummary, formatUsdAmount } from "@/features/customers"

export interface CustomersSummaryProps {
  dateRange: ResolvedOperationalDateRange | null
  isLoading?: boolean
}

const ZERO_USD = formatUsdAmount(0)

function formatKpiMoney(value: number | string | null | undefined): string {
  if (value == null) return ZERO_USD
  const n = typeof value === "number" ? value : Number.parseFloat(String(value))
  if (Number.isFinite(n)) return formatUsdAmount(n)
  return ZERO_USD
}

export function CustomersSummary({ dateRange, isLoading: listLoading = false }: CustomersSummaryProps) {
  const { summary, isLoading: summaryLoading, error } = useCustomerSummary(dateRange)
  const [selectedThemeId, setSelectedThemeId] = useState("default")
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("customers-summary-theme")
    if (saved) setSelectedThemeId(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("customers-summary-theme", selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)
  const isLoading = listLoading || summaryLoading

  const activeCount = summary?.active_customers_count ?? 0
  const salesTotal = dateRange ? formatKpiMoney(summary?.sales_total_in_period) : ZERO_USD
  const receivablesTotal = formatKpiMoney(summary?.customer_receivables_total)
  const creditTotal = formatKpiMoney(summary?.customer_credit_total)

  const cards: SummaryCard[] = [
    {
      title: "الزبائن النشطون",
      value: activeCount,
      icon: Users,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "إجمالي المبيعات خلال الفترة",
      value: salesTotal,
      icon: ShoppingCart,
      colorKey: "info",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "إجمالي المستحقات من الزبائن",
      value: receivablesTotal,
      icon: CreditCard,
      colorKey: "warning",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "الرصيد الدائن للزبائن",
      value: creditTotal,
      icon: Check,
      colorKey: "success",
      showPercentage: false,
      showProgress: false,
    },
  ]

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          تعذر تحميل بعض إحصائيات الزبائن.
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
