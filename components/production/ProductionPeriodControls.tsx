"use client"

import { CalendarRange, ChevronDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PRODUCTION_PERIOD_LABELS_AR, PRODUCTION_PERIOD_PRESETS, type ProductionPeriodPreset } from "@/src/features/production"

export function ProductionPeriodControls({ preset, onPresetChange }: { preset: ProductionPeriodPreset; onPresetChange: (preset: ProductionPeriodPreset) => void }) {
  const all = preset === "all"
  const shared = "h-9 min-w-28 gap-2 rounded-xl px-3 text-sm"
  const active = "border-primary/55 bg-primary/[0.11] text-foreground [&_svg]:text-primary"
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button type="button" variant="outline" size="sm" className={cn(shared, all ? active : "text-muted-foreground")} onClick={() => onPresetChange("all")}>
        <Layers className="size-3.5" />الكل
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className={cn(shared, !all ? active : "text-muted-foreground")}>
            <CalendarRange className="size-3.5" /><span className="min-w-0 flex-1 truncate">{all ? "الفترة" : PRODUCTION_PERIOD_LABELS_AR[preset]}</span><ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {PRODUCTION_PERIOD_PRESETS.map((value) => <DropdownMenuItem key={value} className="justify-end" onClick={() => onPresetChange(value)}>{PRODUCTION_PERIOD_LABELS_AR[value]}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
