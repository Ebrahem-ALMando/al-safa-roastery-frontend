"use client"

import { useEffect, useState } from "react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById, summaryCardsThemes } from "@/components/ui/summary-cards-themes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarDays, Check, CheckCircle2, Palette, UserX, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient, PatientsListMeta } from "@/features/patients"

export interface PatientsSummaryProps {
  patients: Patient[]
  meta?: PatientsListMeta
  isLoading?: boolean
}

export function PatientsSummary({ patients, meta, isLoading = false }: PatientsSummaryProps) {
  const [selectedThemeId, setSelectedThemeId] = useState("default")
  const [themeOpen, setThemeOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("patients-summary-theme")
    if (saved) setSelectedThemeId(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("patients-summary-theme", selectedThemeId)
  }, [selectedThemeId])

  const currentTheme = getThemeById(selectedThemeId)

  const total = meta?.total ?? 0
  const active = patients.filter((p) => p.is_active).length
  const inactive = patients.filter((p) => !p.is_active).length
  const now = new Date()
  const currentMonthPatients = patients.filter((p) => {
    if (!p.created_at) return false
    const created = new Date(p.created_at)
    if (Number.isNaN(created.getTime())) return false
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
  }).length

  const activePercentage = total > 0 ? (active / total) * 100 : 0
  const inactivePercentage = total > 0 ? (inactive / total) * 100 : 0
  const currentMonthPercentage = total > 0 ? (currentMonthPatients / total) * 100 : 0

  const cards: SummaryCard[] = [
    {
      title: "إجمالي المرضى",
      value: total,
      icon: Users,
      colorKey: "primary",
      showPercentage: false,
      showProgress: false,
    },
    {
      title: "المرضى النشطون",
      value: active,
      icon: CheckCircle2,
      colorKey: "success",
      percentage: activePercentage,
      showPercentage: true,
      showProgress: true,
    },
    {
      title: "غير النشطين",
      value: inactive,
      icon: UserX,
      colorKey: "warning",
      percentage: inactivePercentage,
      showPercentage: true,
      showProgress: true,
    },
    {
      title: "مرضى الشهر الحالي",
      value: currentMonthPatients,
      icon: CalendarDays,
      colorKey: "info",
      percentage: currentMonthPercentage,
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
              <span className="text-primary font-medium">تغيير الثيم</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
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

