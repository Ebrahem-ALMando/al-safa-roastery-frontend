"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, CreditCard, ShoppingCart, Truck } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { useSuppliersSummary, formatUsdAmount } from "@/features/suppliers"

export interface SuppliersSummaryProps {
  dateRange: ResolvedOperationalDateRange | null
  isLoading?: boolean
}

/** Zero-state fallback for money KPIs when backend data is absent (not a calculated aggregate). */
const ZERO_USD = formatUsdAmount(0)

/**
 * Maps report/API money values to display. Falls back to $0.00 — not a paginated-list calculation.
 * TODO: `supplier_credit_total` needs backend card on reports/balances — see docs/suppliers-backend-polish-needed.md
 */
function formatKpiMoney(value: string | null): string {
  if (value == null) return ZERO_USD
  const n = Number.parseFloat(value)
  if (Number.isFinite(n)) return formatUsdAmount(n)
  return ZERO_USD
}

export function SuppliersSummary({ dateRange, isLoading: listLoading = false }: SuppliersSummaryProps) {
  const { summary, isLoading: summaryLoading, error } = useSuppliersSummary(dateRange)
  const [selectedThemeId, setSelectedThemeId] = useState("default")
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("suppliers-summary-theme")
    if (saved) setSelectedThemeId(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("suppliers-summary-theme", selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)
  const isLoading = listLoading || summaryLoading

  const activeCount = summary.activeSuppliersCount ?? 0
  const purchasesTotal = dateRange
    ? formatKpiMoney(summary.purchasesTotalInPeriod)
    : ZERO_USD
  const payableTotal = formatKpiMoney(summary.suppliersPayableTotal)
  // Backend lacks `supplier_credit_total` card — display zero until endpoint exposes it accurately.
  const creditTotal = formatKpiMoney(summary.supplierCreditTotal)

  const cards: SummaryCard[] = [
    {
      title: "الموردون النشطون",
      value: activeCount,
      icon: Truck,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "إجمالي المشتريات خلال الفترة",
      value: purchasesTotal,
      icon: ShoppingCart,
      colorKey: "info",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "إجمالي المستحقات للموردين",
      value: payableTotal,
      icon: CreditCard,
      colorKey: "warning",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "الرصيد الدائن لنا لدى الموردين",
      value: creditTotal,
      icon: CheckCircle2,
      colorKey: "success",
      showPercentage: false,
      showProgress: false,
    },
  ]

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          تعذر تحميل بعض إحصائيات الموردين.
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
