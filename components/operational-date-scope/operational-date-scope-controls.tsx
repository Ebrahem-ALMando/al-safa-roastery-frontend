"use client"

import { CalendarRange, ChevronDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  OPERATIONAL_SCOPE_DROPDOWN_PRESETS,
  OPERATIONAL_SCOPE_PRESET_LABELS_AR,
} from "@/lib/date-scope/operational-date-scope-labels"
import type { OperationalDateScopePreset } from "@/lib/date-scope/operational-date-scope.types"

const rowBtn =
  "h-9 gap-1.5 rounded-xl px-2.5 text-xs sm:gap-2 sm:px-3 sm:text-sm min-w-[6.75rem] sm:min-w-[7.75rem]"
const dropdownBtnWidth = "min-w-[7.75rem] sm:min-w-[8.75rem]"

const activeScopeBtn =
  "border-primary/55 bg-primary/[0.11] text-foreground shadow-none hover:bg-primary/[0.16] [&_svg]:text-primary"

const inactiveScopeBtn = "border-border text-muted-foreground [&_svg]:opacity-70"

type Props = {
  preset: OperationalDateScopePreset
  onPresetChange: (preset: OperationalDateScopePreset) => void
  className?: string
  /** سطر مختصر أسفل أزرار النطاق (مثلاً المدى الفعلي بعد الدمج) */
  effectiveRangeFootnote?: string | null
  /** تلميحة كاملة — غالبًا تطابق عمود وقت الطلب + تطابق البطاقات مع الجدول */
  effectiveRangeTooltip?: string | null
}

export function OperationalDateScopeControls({
  preset,
  onPresetChange,
  className,
  effectiveRangeFootnote,
  effectiveRangeTooltip,
}: Props) {
  const allActive = preset === "all"
  const dropdownActive = !allActive
  const triggerLabel = allActive ? "الفترة" : OPERATIONAL_SCOPE_PRESET_LABELS_AR[preset]

  const row = (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(rowBtn, allActive ? activeScopeBtn : inactiveScopeBtn)}
        onClick={() => onPresetChange("all")}
      >
        <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{OPERATIONAL_SCOPE_PRESET_LABELS_AR.all}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(rowBtn, dropdownBtnWidth, dropdownActive ? activeScopeBtn : inactiveScopeBtn)}
          >
            <CalendarRange className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-right">{triggerLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {OPERATIONAL_SCOPE_DROPDOWN_PRESETS.map((p) => (
            <DropdownMenuItem
              key={p}
              className="cursor-pointer justify-end text-right"
              onClick={() => onPresetChange(p)}
            >
              {OPERATIONAL_SCOPE_PRESET_LABELS_AR[p]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const foot =
    effectiveRangeFootnote != null && effectiveRangeFootnote !== "" ? (
      <p
        className="max-w-48 truncate text-center text-[10px] leading-tight text-muted-foreground sm:max-w-60"
        title={effectiveRangeTooltip ?? effectiveRangeFootnote}
      >
        {effectiveRangeFootnote}
      </p>
    ) : null

  const wrapped = (
    <div
      className={cn(
        "flex shrink-0 flex-col items-stretch gap-0.5 sm:items-end",
        effectiveRangeTooltip != null && effectiveRangeTooltip.trim() !== "" ? "outline-none" : undefined,
        className
      )}
      tabIndex={effectiveRangeTooltip != null && effectiveRangeTooltip.trim() !== "" ? 0 : undefined}
    >
      {row}
      {foot}
    </div>
  )

  if (effectiveRangeTooltip != null && effectiveRangeTooltip.trim() !== "") {
    return (
      <Tooltip delayDuration={280}>
        <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6} className="max-w-xs text-right">
          {effectiveRangeTooltip}
        </TooltipContent>
      </Tooltip>
    )
  }

  return wrapped
}
