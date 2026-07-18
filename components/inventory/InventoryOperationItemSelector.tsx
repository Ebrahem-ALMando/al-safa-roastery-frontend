"use client"

import { useState } from "react"
import { Package, RefreshCw } from "lucide-react"
import { ItemPickerDialog } from "@/components/purchases/editor/ItemPickerDialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"
import { formatInventoryQuantity, inventoryNumber, type InventoryItem } from "@/src/features/inventory"
import { InventoryStockStatusBadge } from "./InventoryStockStatusBadge"

function toInventoryItem(row: ItemPickerRow): InventoryItem {
  const quantity = inventoryNumber(row.currentQuantityKg)
  const averageCost = inventoryNumber(row.averageCost)
  return {
    id: Number(row.id),
    code: row.code === "—" ? "" : row.code,
    name: row.name,
    item_type: row.itemType,
    unit: "kg",
    current_quantity_kg: quantity,
    average_cost: averageCost,
    last_purchase_price: row.lastPurchasePrice ?? 0,
    minimum_quantity_kg: 0,
    stock_status: quantity > 0 ? "available" : "out_of_stock",
    reorder_required: false,
    stock_value: quantity * averageCost,
    is_active: true,
    notes: null,
    last_activity: null,
    movements_count_in_period: null,
    latest_movement: null,
    movement_totals_in_period: null,
    created_at: "",
    updated_at: "",
  }
}

export function InventoryOperationItemSelector({
  item,
  onChange,
  error,
  disabled = false,
}: {
  item: InventoryItem | null
  onChange: (item: InventoryItem) => void
  error?: string
  disabled?: boolean
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <>
      {item ? (
        <div className={cn("flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/15 p-4", error && "border-destructive/50")}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary shadow-sm">
            <Package className="size-5" />
          </span>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate font-semibold">{item.name}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">{item.code || `#${item.id}`}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <InventoryStockStatusBadge item={item} />
            <span className="font-semibold tabular-nums" dir="ltr">{formatInventoryQuantity(item.current_quantity_kg)}</span>
            <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" disabled={disabled} onClick={() => setPickerOpen(true)}>
              <RefreshCw className="size-3.5" />
              تغيير
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn("h-14 w-full justify-start gap-3 rounded-xl border-dashed", error && "border-destructive/50 text-destructive")}
          disabled={disabled}
          onClick={() => setPickerOpen(true)}
        >
          <Package className="size-5" />
          اختر الصنف المراد تنفيذ العملية عليه
        </Button>
      )}
      {error ? <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p> : null}

      <ItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(row) => onChange(toInventoryItem(row))}
        activeOnly
        selectionMode="single"
        title="اختيار صنف المخزون"
        description="ابحث بالاسم أو الكود ثم اختر الصنف المطلوب."
      />
    </>
  )
}
