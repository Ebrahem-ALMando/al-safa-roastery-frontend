"use client"

/**
 * SummaryCards - Reusable summary cards component
 *
 * Responsibilities:
 * - Display summary statistics in card grid
 * - Support up to 8 cards
 * - Custom icons and colors
 * - Loading states
 * - Beautiful hover effects and golden accents
 *
 * Rules:
 * - UI only - no logic
 * - Generic and reusable
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { Theme } from "./summary-cards-themes"
import { defaultTheme } from "./summary-cards-themes"

export interface SummaryCard {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  valueDescription?: string
  valueDir?: "ltr" | "rtl"
  badge?: string
  percentage?: number | string | null
  showPercentage?: boolean
  showProgress?: boolean
  colorKey?: "primary" | "success" | "warning" | "danger" | "info" | "secondary" | "accent" | "muted"
  className?: string
  onClick?: () => void
}

export interface SummaryCardsProps {
  cards: SummaryCard[]
  isLoading?: boolean
  className?: string
  theme?: Theme
}

export function SummaryCards({
  cards,
  isLoading = false,
  className,
  theme = defaultTheme,
}: SummaryCardsProps) {
  const displayCards = cards.slice(0, 8)

  if (isLoading) {
    const skeletonCount = Math.min(displayCards.length > 0 ? displayCards.length : 4, 8)
    return (
      <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card
            key={i}
            className={cn(
              "animate-pulse border-0 shadow-md dark:shadow-gray-900/10",
              displayCards[i]?.className
            )}
          >
            <CardHeader className="pb-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (displayCards.length === 0) return null

  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {displayCards.map((card, index) => {
        const colorKey = card.colorKey || "primary"
        const colors = theme.colors[colorKey]
        const Icon = card.icon
        const percentage = card.percentage
        const showPercentage = card.showPercentage !== false && percentage !== null && percentage !== undefined
        const showProgress = card.showProgress !== false && percentage !== null && percentage !== undefined

        return (
          <Card
            key={index}
            onClick={card.onClick}
            className={cn(
              "overflow-hidden relative group transition-all duration-300 border-2 shadow-md",
              "hover:shadow-xl hover:scale-[1.02] dark:shadow-gray-900/10",
              "hover:border-[#fbbf24]/30 dark:hover:border-[#fbbf24]/20",
              card.onClick ? "cursor-pointer" : "",
              `bg-linear-to-br ${colors.bg} ${colors.bgDark}`,
              colors.border,
              card.className
            )}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/50 via-[#fbbf24]/5 to-transparent dark:from-white/5 dark:via-[#fbbf24]/10 dark:to-transparent pointer-events-none" />

            <div className="absolute -left-4 -bottom-6 opacity-10 transition-all duration-500 group-hover:opacity-20 group-hover:scale-110 group-hover:rotate-12">
              <div className="relative">
                <Icon className={cn("h-24 w-24 md:h-28 md:w-28", colors.icon)} />
                <div className="absolute inset-0 bg-linear-to-br from-[#fbbf24]/20 to-transparent blur-xl" />
              </div>
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="h-4 w-4 text-[#fbbf24] animate-pulse" />
            </div>

            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2 relative z-10">
              <div className="min-w-0 flex-1">
                <CardTitle className={cn("max-w-full whitespace-normal break-words text-sm font-medium leading-6", colors.text)}>
                  {card.title}
                </CardTitle>
                {card.description ? (
                  <p className={cn("text-xs mt-1 text-muted-foreground/80", colors.text)}>
                    {card.description}
                  </p>
                ) : null}
                {card.badge ? (
                  <Badge className="mt-1 text-[10px] px-2 py-0.5 bg-[#fbbf24]/20 text-[#f59e0b] dark:bg-[#fbbf24]/10 dark:text-[#fcd34d] border-[#fbbf24]/30">
                    {card.badge}
                  </Badge>
                ) : null}
              </div>
              <div
                className={cn(
                  "rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                  "group-hover:shadow-lg group-hover:shadow-[#fbbf24]/20",
                  `bg-linear-to-br ${colors.iconBg}`,
                  colors.icon,
                  "shrink-0 self-start shadow-sm border border-[#fbbf24]/20"
                )}
              >
                <Icon className="h-5 w-5 drop-shadow-[0_0_2px_rgba(251,191,36,0.3)]" />
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="flex items-end justify-between">
                <div>
                  <div
                    className={cn("text-3xl font-bold transition-all group-hover:scale-105", colors.text)}
                    dir={card.valueDir}
                  >
                    {typeof card.value === "number" ? card.value.toLocaleString("ar-EG") : card.value}
                  </div>
                  {card.valueDescription ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.valueDescription}
                    </p>
                  ) : null}
                </div>

                {showPercentage ? (
                  <div className="flex flex-col items-end gap-1">
                  <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 border-2",
                        colors.icon,
                      `bg-linear-to-br ${colors.iconBg}`,
                        "border-[#fbbf24]/30"
                      )}
                    >
                      {typeof percentage === "number" ? percentage.toFixed(1) : percentage}%
                    </Badge>
                    {index > 0 && index < 8 ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>من الكل</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {showProgress ? (
                <div className="mt-3 h-1.5 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 relative",
                      `bg-linear-to-r ${colors.iconBg}`
                    )}
                    style={{
                      width: `${Math.min(typeof percentage === "number" ? percentage : parseFloat(percentage as string) || 0, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#fbbf24]/30 to-transparent animate-pulse" />
                  </div>
                </div>
              ) : null}

              {index === 0 ? (
                <div className="mt-3 h-0.5 bg-linear-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
