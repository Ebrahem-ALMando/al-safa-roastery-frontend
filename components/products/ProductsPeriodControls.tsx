"use client"

import { CalendarRange, ChevronDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  PRODUCTS_PERIOD_DROPDOWN_PRESETS,
  PRODUCTS_PERIOD_LABELS_AR,
  type ProductsPeriodPreset,
} from "@/features/products"

const rowBtn =
  "h-9 gap-1.5 rounded-xl px-2.5 text-xs sm:gap-2 sm:px-3 sm:text-sm min-w-[6.75rem] sm:min-w-[7.75rem]"
const dropdownBtnWidth = "min-w-[7.75rem] sm:min-w-[8.75rem]"
const activeScopeBtn =
  "border-primary/55 bg-primary/[0.11] text-foreground shadow-none hover:bg-primary/[0.16] [&_svg]:text-primary"
const inactiveScopeBtn = "border-border text-muted-foreground [&_svg]:opacity-70"

export function ProductsPeriodControls({
  preset,
  onPresetChange,
  className,
}: {
  preset: ProductsPeriodPreset
  onPresetChange: (preset: ProductsPeriodPreset) => void
  className?: string
}) {
  const allActive = preset === "all"
  const triggerLabel = allActive ? "الفترة" : PRODUCTS_PERIOD_LABELS_AR[preset]

  return (
    <div className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(rowBtn, allActive ? activeScopeBtn : inactiveScopeBtn)}
        onClick={() => onPresetChange("all")}
      >
        <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{PRODUCTS_PERIOD_LABELS_AR.all}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(rowBtn, dropdownBtnWidth, !allActive ? activeScopeBtn : inactiveScopeBtn)}
          >
            <CalendarRange className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-right">{triggerLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {PRODUCTS_PERIOD_DROPDOWN_PRESETS.map((p) => (
            <DropdownMenuItem
              key={p}
              className="cursor-pointer justify-end text-right"
              onClick={() => onPresetChange(p)}
            >
              {PRODUCTS_PERIOD_LABELS_AR[p]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
