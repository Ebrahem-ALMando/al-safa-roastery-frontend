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
  INVENTORY_ITEM_TYPE_LABELS_AR,
  INVENTORY_STOCK_STATUS_LABELS_AR,
  type InventoryItemType,
  type InventoryMovementPickerItem,
  type InventoryStockStatusFilter,
} from "@/src/features/inventory"

export type InventoryFiltersValue = {
  search: string
  itemType: InventoryItemType | "all"
  stockStatus: InventoryStockStatusFilter | "all"
  selectedItems: InventoryMovementPickerItem[]
  quantityMin: string
  quantityMax: string
}

type Props = {
  value: InventoryFiltersValue
  onChange: (value: InventoryFiltersValue) => void
  onReset: () => void
  isLoading?: boolean
}

function pickerItem(row: ItemPickerRow): InventoryMovementPickerItem {
  return {
    id: Number(row.id),
    name: row.name,
    code: row.code === "—" ? "" : row.code,
    item_type: row.itemType,
  }
}

function itemLabel(item: InventoryMovementPickerItem): string {
  return item.code ? `${item.name} · ${item.code}` : item.name
}

export function InventoryFilters({ value, onChange, onReset, isLoading = false }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [itemPickerOpen, setItemPickerOpen] = useState(false)
  const statusLabel = value.stockStatus !== "all" ? INVENTORY_STOCK_STATUS_LABELS_AR[value.stockStatus] : undefined
  const typeLabel = value.itemType !== "all" ? INVENTORY_ITEM_TYPE_LABELS_AR[value.itemType] : undefined
  const hasActiveFilters = Boolean(
    value.search.trim() ||
    value.itemType !== "all" ||
    value.stockStatus !== "all" ||
    value.selectedItems.length > 0 ||
    value.quantityMin ||
    value.quantityMax
  )

  function addItems(rows: ItemPickerRow[]) {
    const items = new Map(value.selectedItems.map((item) => [item.id, item]))
    rows.forEach((row) => {
      const item = pickerItem(row)
      items.set(item.id, item)
    })
    onChange({ ...value, selectedItems: Array.from(items.values()) })
  }

  function removeItem(id: number) {
    onChange({ ...value, selectedItems: value.selectedItems.filter((item) => item.id !== id) })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="ابحث باسم الصنف أو الكود..."
            className="w-full pr-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => setShowAdvanced((current) => !current)}
          >
            <Filter className="size-4" />
            بحث متقدم
            <ChevronDown className={cn("size-4 transition-transform", showAdvanced && "rotate-180")} />
          </Button>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onReset}
            >
              <X className="ml-1 size-4" />
              مسح الفلاتر
            </Button>
          ) : null}
        </div>
      </div>

      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", showAdvanced ? "max-h-72 opacity-100" : "max-h-0 opacity-0")}>
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4 md:items-end">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">نوع الصنف</Label>
            <Select value={value.itemType} disabled={isLoading} onValueChange={(itemType) => onChange({ ...value, itemType: itemType as InventoryItemType | "all" })}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="raw">{INVENTORY_ITEM_TYPE_LABELS_AR.raw}</SelectItem>
                <SelectItem value="ready">{INVENTORY_ITEM_TYPE_LABELS_AR.ready}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">حالة المخزون</Label>
            <Select value={value.stockStatus} disabled={isLoading} onValueChange={(stockStatus) => onChange({ ...value, stockStatus: stockStatus as InventoryStockStatusFilter | "all" })}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="reorder_required">{INVENTORY_STOCK_STATUS_LABELS_AR.reorder_required}</SelectItem>
                <SelectItem value="available">{INVENTORY_STOCK_STATUS_LABELS_AR.available}</SelectItem>
                <SelectItem value="low">{INVENTORY_STOCK_STATUS_LABELS_AR.low}</SelectItem>
                <SelectItem value="out_of_stock">{INVENTORY_STOCK_STATUS_LABELS_AR.out_of_stock}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">الأصناف</Label>
            <Button type="button" variant="outline" className="h-10 w-full justify-between font-normal" disabled={isLoading} onClick={() => setItemPickerOpen(true)}>
              <span className="truncate">
                {value.selectedItems.length === 0
                  ? "اختر صنفًا أو أكثر..."
                  : value.selectedItems.length === 1
                    ? itemLabel(value.selectedItems[0])
                    : `${value.selectedItems.length} أصناف محددة`}
              </span>
              <Package className="ml-2 size-4 shrink-0 opacity-60" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">نطاق الكمية</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={value.quantityMin} onChange={(event) => onChange({ ...value, quantityMin: event.target.value })} placeholder="من" inputMode="decimal" dir="ltr" />
              <Input value={value.quantityMax} onChange={(event) => onChange({ ...value, quantityMax: event.target.value })} placeholder="إلى" inputMode="decimal" dir="ltr" />
            </div>
          </div>
        </div>
      </div>

      {value.selectedItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.selectedItems.map((item) => <FilterChip key={item.id} label={itemLabel(item)} onClear={() => removeItem(item.id)} />)}
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
          {value.search.trim() ? <FilterChip label={`البحث: ${value.search}`} onClear={() => onChange({ ...value, search: "" })} /> : null}
          {typeLabel ? <FilterChip label={`النوع: ${typeLabel}`} onClear={() => onChange({ ...value, itemType: "all" })} /> : null}
          {statusLabel ? <FilterChip label={`المخزون: ${statusLabel}`} onClear={() => onChange({ ...value, stockStatus: "all" })} /> : null}
          {value.quantityMin ? <FilterChip label={`الكمية من: ${value.quantityMin}`} onClear={() => onChange({ ...value, quantityMin: "" })} /> : null}
          {value.quantityMax ? <FilterChip label={`الكمية إلى: ${value.quantityMax}`} onClear={() => onChange({ ...value, quantityMax: "" })} /> : null}
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
        title="اختيار أصناف المخزون"
        description="ابحث بالاسم أو الكود ثم اختر صنفًا أو أكثر لتصفية بيانات المخزون."
      />
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
      {label}
      <button type="button" className="mr-1 rounded-full p-0.5 hover:bg-sky-200/80" onClick={onClear} aria-label={`إزالة ${label}`}>
        <X className="size-3" />
      </button>
    </Badge>
  )
}
