"use client"

import { useEffect, useState } from "react"
import { Check, CheckCheck, ClipboardList, FileClock, Palette, ShieldCheck, TestTubeDiagonal, XCircle } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LabOrder, LabOrdersListMeta } from "@/features/orders"
import { orderHasNonNormalResultFlag } from "./orders-helpers"

interface OrdersSummaryProps {
  orders: LabOrder[]
  meta?: LabOrdersListMeta
  isLoading?: boolean
}

export function OrdersSummary({ orders, meta, isLoading = false }: OrdersSummaryProps) {
  const [selectedThemeId, setSelectedThemeId] = useState("default")
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("orders-summary-theme")
    if (saved) setSelectedThemeId(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("orders-summary-theme", selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)

  const total = meta?.total ?? 0
  const pending = orders.filter((o) => o.status === "pending").length
  const inProgress = orders.filter((o) => o.status === "in_progress").length
  const completed = orders.filter((o) => o.status === "completed").length
  const approved = orders.filter((o) => o.status === "approved").length
  const cancelled = orders.filter((o) => o.status === "cancelled").length
  const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0)
  const ordersWithFlaggedResults = orders.filter((o) => orderHasNonNormalResultFlag(o)).length

  const ratio = (value: number) => (orders.length > 0 ? (value / orders.length) * 100 : 0)

  const cards: SummaryCard[] = [
    { title: "إجمالي الطلبات", value: total, icon: ClipboardList, colorKey: "primary", showPercentage: false, showProgress: false },
    { title: "قيد الانتظار", value: pending, icon: FileClock, colorKey: "warning", percentage: ratio(pending), showPercentage: true, showProgress: true },
    { title: "قيد التنفيذ", value: inProgress, icon: TestTubeDiagonal, colorKey: "info", percentage: ratio(inProgress), showPercentage: true, showProgress: true },
    { title: "مكتملة", value: completed, icon: Check, colorKey: "success", percentage: ratio(completed), showPercentage: true, showProgress: true },
    { title: "معتمدة", value: approved, icon: ShieldCheck, colorKey: "accent", percentage: ratio(approved), showPercentage: true, showProgress: true },
    { title: "ملغاة", value: cancelled, icon: XCircle, colorKey: "danger", percentage: ratio(cancelled), showPercentage: true, showProgress: true },
    { title: "عدد التحاليل", value: totalItems, icon: TestTubeDiagonal, colorKey: "secondary", showPercentage: false, showProgress: false },
    {
      title: "طلبات بنتائج غير طبيعية",
      value: ordersWithFlaggedResults,
      icon: CheckCheck,
      colorKey: "muted",
      percentage: ratio(ordersWithFlaggedResults),
      showPercentage: true,
      showProgress: true,
    },
  ]

  return (
    <div className="space-y-4">
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
                      <div className="mt-2 flex gap-1.5">
                        {theme.colors.primary.preview?.map((color) => (
                          <span key={`${theme.id}-${color}`} className={cn("h-5 w-5 rounded-full border border-white/60", color)} />
                        ))}
                      </div>
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
