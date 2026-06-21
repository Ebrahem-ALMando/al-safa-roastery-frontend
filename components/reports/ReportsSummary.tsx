"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, CalendarDays, Check, FileText, Palette } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LabOrder, LabOrdersListMeta } from "@/features/orders"
import { effectiveLabOrdersDateMergeFootnoteAr } from "@/lib/date-scope/effective-lab-order-query-range-ar"

export interface ReportsSummaryProps {
  orders: LabOrder[]
  meta?: LabOrdersListMeta
  isLoading?: boolean
}

const THEME_KEY = "reports-summary-theme"

function toLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** أسبوع يبدأ السبت حتى اليوم الحالي — لعدّ الطلبات في الصفحة الحالية كما يُنشَأ «الشهر الحالي» من صف واحد في PatientsSummary */
function calendarWeekSaturdayToToday(now = new Date()): { from: string; to: string } {
  const base = new Date(now)
  const day = base.getDay()
  const diffToSaturday = (day + 1) % 7
  base.setDate(base.getDate() - diffToSaturday)
  base.setHours(0, 0, 0, 0)
  return { from: toLocalYmd(base), to: toLocalYmd(now) }
}

function orderedAtYmd(order: LabOrder): string | null {
  if (!order.ordered_at) return null
  const dt = new Date(order.ordered_at)
  return Number.isNaN(dt.getTime()) ? null : toLocalYmd(dt)
}

function orderInInclusiveYmdRange(order: LabOrder, from: string, to: string): boolean {
  const y = orderedAtYmd(order)
  if (!y) return false
  return y >= from && y <= to
}

export function ReportsSummary({ orders, meta, isLoading = false }: ReportsSummaryProps) {
  const [selectedThemeId, setSelectedThemeId] = useState("default")
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) setSelectedThemeId(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)

  const calendarWeek = useMemo(() => calendarWeekSaturdayToToday(), [])

  const weekRangeFootnote =
    effectiveLabOrdersDateMergeFootnoteAr({ from: calendarWeek.from, to: calendarWeek.to }) ??
    `${calendarWeek.from} ⟶ ${calendarWeek.to}`

  const total = meta?.total ?? 0

  /** كما PatientsSummary: الإحصاءات من الصفحة الحالية، والنسب من إجمالي المجموعة المصفّاة meta.total */
  const weekCompletedOnPage = orders.filter((o) => orderInInclusiveYmdRange(o, calendarWeek.from, calendarWeek.to)).length

  const abnormalOnPage = orders.filter((o) => o.items?.some((it) => it.is_abnormal)).length

  const weekPercentage = total > 0 ? (weekCompletedOnPage / total) * 100 : 0
  const abnormalPercentage = total > 0 ? (abnormalOnPage / total) * 100 : 0

  const cards: SummaryCard[] = [
    {
      title: "إجمالي التقارير الجاهزة",
      value: total,
      icon: FileText,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
      className: "sm:col-span-2 lg:col-span-2",
    },
    {
      title: "مكتملة هذا الأسبوع",
      value: weekCompletedOnPage,
      description: weekRangeFootnote,
      icon: CalendarDays,
      colorKey: "info",
      percentage: weekPercentage,
      showPercentage: true,
      showProgress: true,
    },
    {
      title: "تقارير بنتائج غير طبيعية",
      value: abnormalOnPage,
      icon: Activity,
      colorKey: "danger",
      percentage: abnormalPercentage,
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
