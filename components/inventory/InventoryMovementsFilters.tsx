"use client"

import { useState } from "react"
import { ChevronDown, Filter, Package, Search, X } from "lucide-react"
import { ItemPickerDialog } from "@/components/purchases/editor/ItemPickerDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"
import { cn } from "@/lib/utils"
import {
  INVENTORY_DIRECTION_FILTER_LABELS_AR,
  INVENTORY_MOVEMENT_TYPE_OPTIONS,
  INVENTORY_SOURCE_TYPE_OPTIONS,
  type InventoryDirectionFilter,
  type InventoryMovementPickerItem,
} from "@/src/features/inventory"

export type InventoryMovementsFiltersValue = {
  search: string
  selectedItems: InventoryMovementPickerItem[]
  movementType: string
  direction: InventoryDirectionFilter | "all"
  sourceType: string
}

function pickerItem(row: ItemPickerRow): InventoryMovementPickerItem {
  return { id: Number(row.id), name: row.name, code: row.code === "—" ? "" : row.code, item_type: row.itemType }
}

function itemLabel(item: InventoryMovementPickerItem): string {
  return item.code ? `${item.name} · ${item.code}` : item.name
}

export function InventoryMovementsFilters({ value, onChange, onReset, isLoading = false }: {
  value: InventoryMovementsFiltersValue
  onChange: (value: InventoryMovementsFiltersValue) => void
  onReset: () => void
  isLoading?: boolean
}) {
  const [advancedPreference, setAdvancedPreference] = useState<boolean | null>(null)
  const [itemPickerOpen, setItemPickerOpen] = useState(false)
  const hasActive = Boolean(value.search.trim()) || value.selectedItems.length > 0 || value.movementType !== "all" || value.direction !== "all" || value.sourceType !== "all"
  const hasAdvancedFilters = value.selectedItems.length > 0 || value.movementType !== "all" || value.direction !== "all" || value.sourceType !== "all"
  const showAdvanced = advancedPreference ?? hasAdvancedFilters
  const movementLabel = INVENTORY_MOVEMENT_TYPE_OPTIONS.find((option) => option.value === value.movementType)?.label
  const sourceLabel = INVENTORY_SOURCE_TYPE_OPTIONS.find((option) => option.value === value.sourceType)?.label

  function addItems(rows: ItemPickerRow[]) {
    const items = new Map(value.selectedItems.map((item) => [item.id, item]))
    rows.forEach((row) => {
      const item = pickerItem(row)
      items.set(item.id, item)
    })
    onChange({ ...value, selectedItems: Array.from(items.values()) })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={value.search} onChange={(event) => onChange({ ...value, search: event.target.value })} placeholder="ابحث بالصنف أو الكود أو المرجع..." className="w-full pr-10" />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="flex items-center gap-2 bg-transparent" onClick={() => setAdvancedPreference(!showAdvanced)}>
            <Filter className="size-4" />بحث متقدم<ChevronDown className={cn("size-4 transition-transform", showAdvanced && "rotate-180")} />
          </Button>
          {hasActive ? <Button type="button" variant="ghost" size="sm" className="h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => { setAdvancedPreference(null); onReset() }}><X className="ml-1 size-4" />مسح الفلاتر</Button> : null}
        </div>
      </div>

      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", showAdvanced ? "max-h-72 opacity-100" : "max-h-0 opacity-0")}>
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4 md:items-end">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">الأصناف</Label>
            <Button type="button" variant="outline" className="h-10 w-full justify-between font-normal" disabled={isLoading} onClick={() => setItemPickerOpen(true)}>
              <span className="truncate">{value.selectedItems.length === 0 ? "اختر صنفًا أو أكثر..." : value.selectedItems.length === 1 && value.selectedItems[0] ? itemLabel(value.selectedItems[0]) : `${value.selectedItems.length} أصناف محددة`}</span>
              <Package className="ml-2 size-4 shrink-0 opacity-60" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">نوع الحركة</Label>
            <Select value={value.movementType} onValueChange={(movementType) => onChange({ ...value, movementType })} disabled={isLoading}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent dir="rtl"><SelectItem value="all">الكل</SelectItem>{INVENTORY_MOVEMENT_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">الاتجاه</Label>
            <Select value={value.direction} onValueChange={(direction) => onChange({ ...value, direction: direction as InventoryDirectionFilter | "all" })} disabled={isLoading}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent dir="rtl"><SelectItem value="all">الكل</SelectItem>{Object.entries(INVENTORY_DIRECTION_FILTER_LABELS_AR).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">مصدر الحركة</Label>
            <Select value={value.sourceType} onValueChange={(sourceType) => onChange({ ...value, sourceType })} disabled={isLoading}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent dir="rtl"><SelectItem value="all">الكل</SelectItem>{INVENTORY_SOURCE_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasActive ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="shrink-0 text-sm text-muted-foreground">الفلاتر النشطة:</span>
          {value.selectedItems.map((item) => <FilterChip key={item.id} label={`الصنف: ${itemLabel(item)}`} onClear={() => onChange({ ...value, selectedItems: value.selectedItems.filter((selected) => selected.id !== item.id) })} />)}
          {value.search.trim() ? <FilterChip label={`البحث: ${value.search}`} onClear={() => onChange({ ...value, search: "" })} /> : null}
          {movementLabel ? <FilterChip label={`نوع الحركة: ${movementLabel}`} onClear={() => onChange({ ...value, movementType: "all" })} /> : null}
          {value.direction !== "all" ? <FilterChip label={`الاتجاه: ${INVENTORY_DIRECTION_FILTER_LABELS_AR[value.direction]}`} onClear={() => onChange({ ...value, direction: "all" })} /> : null}
          {sourceLabel ? <FilterChip label={`المصدر: ${sourceLabel}`} onClear={() => onChange({ ...value, sourceType: "all" })} /> : null}
        </div>
      ) : null}

      <ItemPickerDialog
        open={itemPickerOpen}
        onOpenChange={setItemPickerOpen}
        onSelect={(row) => addItems([row])}
        onSelectMany={addItems}
        activeOnly
        selectionMode="multiple"
        excludeItemIds={value.selectedItems.map((item) => item.id)}
        title="اختيار أصناف الحركات"
        description="ابحث بالاسم أو الكود ثم اختر صنفًا أو أكثر لتصفية سجل الحركات."
      />
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return <Badge variant="secondary" className="gap-1 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">{label}<button type="button" className="rounded-full p-0.5 hover:bg-sky-200/80" onClick={onClear} aria-label={`إزالة ${label}`}><X className="size-3" /></button></Badge>
}
