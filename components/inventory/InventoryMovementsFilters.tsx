"use client"

import { useState } from "react"
import { ChevronDown, Filter, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  INVENTORY_DIRECTION_FILTER_LABELS_AR,
  INVENTORY_MOVEMENT_TYPE_OPTIONS,
  INVENTORY_SOURCE_TYPE_OPTIONS,
  type InventoryDirectionFilter,
  type InventoryMovementPickerItem,
} from "@/src/features/inventory"
import { InventoryItemFilterPicker } from "./InventoryItemFilterPicker"

export type InventoryMovementsFiltersValue = {
  search: string
  item: InventoryMovementPickerItem | null
  movementType: string
  direction: InventoryDirectionFilter | "all"
  sourceType: string
}

export function InventoryMovementsFilters({
  value,
  onChange,
  onReset,
  isLoading = false,
}: {
  value: InventoryMovementsFiltersValue
  onChange: (value: InventoryMovementsFiltersValue) => void
  onReset: () => void
  isLoading?: boolean
}) {
  const [advanced, setAdvanced] = useState(true)
  const hasActive = Boolean(value.search.trim()) || value.item !== null || value.movementType !== "all" || value.direction !== "all" || value.sourceType !== "all"
  const movementLabel = INVENTORY_MOVEMENT_TYPE_OPTIONS.find((option) => option.value === value.movementType)?.label
  const sourceLabel = INVENTORY_SOURCE_TYPE_OPTIONS.find((option) => option.value === value.sourceType)?.label

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={value.search} onChange={(event) => onChange({ ...value, search: event.target.value })} placeholder="ابحث بالصنف أو الكود أو المرجع..." className="pr-10" />
        </div>
        <Button type="button" variant="outline" onClick={() => setAdvanced((current) => !current)} className="gap-2">
          <Filter className="size-4" />بحث متقدم<ChevronDown className={cn("size-4 transition-transform", advanced && "rotate-180")} />
        </Button>
        {hasActive ? <Button type="button" variant="ghost" onClick={onReset} className="gap-2 text-rose-600"><X className="size-4" />مسح الفلاتر</Button> : null}
      </div>

      <div className={cn("overflow-hidden transition-all duration-300", advanced ? "max-h-48 opacity-100" : "max-h-0 opacity-0")}>
        <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-4 md:items-end">
          <div className="space-y-2">
            <Label>الصنف</Label>
            <InventoryItemFilterPicker value={value.item} onChange={(item) => onChange({ ...value, item })} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label>نوع الحركة</Label>
            <Select value={value.movementType} onValueChange={(movementType) => onChange({ ...value, movementType })} disabled={isLoading}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">الكل</SelectItem>{INVENTORY_MOVEMENT_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>الاتجاه</Label>
            <Select value={value.direction} onValueChange={(direction) => onChange({ ...value, direction: direction as InventoryDirectionFilter | "all" })} disabled={isLoading}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">الكل</SelectItem>{Object.entries(INVENTORY_DIRECTION_FILTER_LABELS_AR).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>مصدر الحركة</Label>
            <Select value={value.sourceType} onValueChange={(sourceType) => onChange({ ...value, sourceType })} disabled={isLoading}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">الكل</SelectItem>{INVENTORY_SOURCE_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasActive ? (
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
          {value.search.trim() ? <FilterChip label={`البحث: ${value.search}`} onClear={() => onChange({ ...value, search: "" })} /> : null}
          {value.item ? <FilterChip label={`الصنف: ${value.item.name}`} onClear={() => onChange({ ...value, item: null })} /> : null}
          {movementLabel ? <FilterChip label={`نوع الحركة: ${movementLabel}`} onClear={() => onChange({ ...value, movementType: "all" })} /> : null}
          {value.direction !== "all" ? <FilterChip label={`الاتجاه: ${INVENTORY_DIRECTION_FILTER_LABELS_AR[value.direction]}`} onClear={() => onChange({ ...value, direction: "all" })} /> : null}
          {sourceLabel ? <FilterChip label={`المصدر: ${sourceLabel}`} onClear={() => onChange({ ...value, sourceType: "all" })} /> : null}
        </div>
      ) : null}
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return <Badge variant="secondary" className="gap-1 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">{label}<button type="button" className="rounded-full p-0.5 hover:bg-sky-200/80" onClick={onClear} aria-label={`إزالة ${label}`}><X className="size-3" /></button></Badge>
}
