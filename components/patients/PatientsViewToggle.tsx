"use client"

import { LayoutGrid, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PatientsViewMode } from "@/features/patients"

interface PatientsViewToggleProps {
  viewMode: PatientsViewMode
  onViewModeChange: (mode: PatientsViewMode) => void
}

export function PatientsViewToggle({
  viewMode,
  onViewModeChange,
}: PatientsViewToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-background p-1">
      <Button
        variant={viewMode === "cards" ? "default" : "ghost"}
        size="sm"
        className={cn("gap-2", viewMode === "cards" && "bg-primary text-primary-foreground")}
        onClick={() => onViewModeChange("cards")}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">بطاقات</span>
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        className={cn("gap-2", viewMode === "table" && "bg-primary text-primary-foreground")}
        onClick={() => onViewModeChange("table")}
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">جدول</span>
      </Button>
    </div>
  )
}

