"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  INVENTORY_DIRECTION_FILTER_LABELS_AR,
  INVENTORY_MOVEMENT_TYPE_OPTIONS,
  INVENTORY_SOURCE_TYPE_OPTIONS,
  type InventoryDirectionFilter,
} from "@/src/features/inventory"

export type MovementFilterValue = { search: string; movementType: string; direction: InventoryDirectionFilter | "all"; sourceType: string }

export function InventoryMovementFilters({ value, onChange }: { value: MovementFilterValue; onChange: (value: MovementFilterValue) => void }) {
  return <div className="grid gap-3 rounded-xl border bg-muted/10 p-3 md:grid-cols-4">
    <div className="space-y-1.5"><Label>بحث الحركة</Label><Input value={value.search} onChange={(event) => onChange({ ...value, search: event.target.value })} placeholder="المرجع أو الملاحظات..." /></div>
    <div className="space-y-1.5"><Label>نوع الحركة</Label><Select value={value.movementType} onValueChange={(movementType) => onChange({ ...value, movementType })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{INVENTORY_MOVEMENT_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-1.5"><Label>الاتجاه</Label><Select value={value.direction} onValueChange={(direction) => onChange({ ...value, direction: direction as InventoryDirectionFilter | "all" })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{Object.entries(INVENTORY_DIRECTION_FILTER_LABELS_AR).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div>
    <div className="space-y-1.5"><Label>المصدر</Label><Select value={value.sourceType} onValueChange={(sourceType) => onChange({ ...value, sourceType })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{INVENTORY_SOURCE_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
  </div>
}
