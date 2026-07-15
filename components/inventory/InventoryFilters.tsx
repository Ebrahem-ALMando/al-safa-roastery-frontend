"use client"

import { useState } from "react"
import { Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  INVENTORY_ITEM_TYPE_LABELS_AR,
  INVENTORY_STOCK_STATUS_LABELS_AR,
  type InventoryItemType,
  type InventoryStockStatusFilter,
} from "@/src/features/inventory"
import { InventoryItemFilterPicker } from "./InventoryItemFilterPicker"

export type InventoryFiltersValue = {
  search: string
  itemType: InventoryItemType | "all"
  stockStatus: InventoryStockStatusFilter | "all"
  itemId: number | null
  quantityMin: string
  quantityMax: string
}

export function InventoryFilters({ value, onChange, onReset, isLoading = false }: { value: InventoryFiltersValue; onChange: (value: InventoryFiltersValue) => void; onReset: () => void; isLoading?: boolean }) {
  const [advanced, setAdvanced] = useState(true)
  const active = value.search.trim() || value.itemType !== "all" || value.stockStatus !== "all" || value.itemId || value.quantityMin || value.quantityMax
  return <div className="rounded-xl border bg-card p-4 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1"><Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={value.search} onChange={(event) => onChange({ ...value, search: event.target.value })} placeholder="ابحث باسم الصنف أو الكود..." className="pr-10" /></div>
      <Button variant="outline" onClick={() => setAdvanced((current) => !current)} className="gap-2"><Filter className="size-4" />بحث متقدم</Button>
      {active ? <Button variant="ghost" onClick={onReset} className="gap-2 text-rose-600"><X className="size-4" />مسح الفلاتر</Button> : null}
    </div>
    {advanced ? <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-4">
      <div className="space-y-2"><Label>نوع الصنف</Label><Select value={value.itemType} onValueChange={(itemType) => onChange({ ...value, itemType: itemType as InventoryItemType | "all" })} disabled={isLoading}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="raw">{INVENTORY_ITEM_TYPE_LABELS_AR.raw}</SelectItem><SelectItem value="ready">{INVENTORY_ITEM_TYPE_LABELS_AR.ready}</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label>حالة المخزون</Label><Select value={value.stockStatus} onValueChange={(stockStatus) => onChange({ ...value, stockStatus: stockStatus as InventoryStockStatusFilter | "all" })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="reorder_required">{INVENTORY_STOCK_STATUS_LABELS_AR.reorder_required}</SelectItem><SelectItem value="available">{INVENTORY_STOCK_STATUS_LABELS_AR.available}</SelectItem><SelectItem value="low">{INVENTORY_STOCK_STATUS_LABELS_AR.low}</SelectItem><SelectItem value="out_of_stock">{INVENTORY_STOCK_STATUS_LABELS_AR.out_of_stock}</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label>الصنف</Label><InventoryItemFilterPicker value={value.itemId} onChange={(item) => onChange({ ...value, itemId: item?.id ?? null })} disabled={isLoading} /></div>
      <div className="space-y-2"><Label>نطاق الكمية</Label><div className="grid grid-cols-2 gap-2"><Input value={value.quantityMin} onChange={(event) => onChange({ ...value, quantityMin: event.target.value })} placeholder="من الكمية" inputMode="decimal" dir="ltr" /><Input value={value.quantityMax} onChange={(event) => onChange({ ...value, quantityMax: event.target.value })} placeholder="إلى الكمية" inputMode="decimal" dir="ltr" /></div></div>
    </div> : null}
  </div>
}
