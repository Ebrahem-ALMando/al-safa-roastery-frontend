"use client"

import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  STATEMENT_MOVEMENT_DIRECTION_OPTIONS,
  STATEMENT_MOVEMENT_TYPE_OPTIONS,
  type StatementEntityType,
  type StatementMovementDirection,
  type StatementMovementEntryType,
} from "@/src/features/statements"

type Props = {
  entityType: StatementEntityType
  search: string
  entryType: StatementMovementEntryType | ""
  direction: StatementMovementDirection | ""
  amountMin: string
  amountMax: string
  amountRangeInvalid: boolean
  disabled?: boolean
  onSearch: (value: string) => void
  onEntryType: (value: StatementMovementEntryType | "") => void
  onDirection: (value: StatementMovementDirection | "") => void
  onAmountMin: (value: string) => void
  onAmountMax: (value: string) => void
  onClear: () => void
}

export function StatementMovementFilters(props: Props) {
  const typeOptions = STATEMENT_MOVEMENT_TYPE_OPTIONS.filter((option) => !option.entityType || option.entityType === props.entityType)
  const active = Boolean(props.search || props.entryType || props.direction || props.amountMin || props.amountMax)
  const typeLabel = typeOptions.find((option) => option.value === props.entryType)?.label
  const directionLabel = STATEMENT_MOVEMENT_DIRECTION_OPTIONS.find((option) => option.value === props.direction)?.label

  return <div className="space-y-3 rounded-xl border bg-card p-3" dir="rtl">
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_160px_140px_140px_auto]">
      <div className="relative min-w-0">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={props.search} onChange={(event) => props.onSearch(event.target.value)} placeholder="ابحث بالمرجع أو البيان أو نوع الحركة..." className="pr-9" disabled={props.disabled} />
      </div>
      <Select value={props.entryType || "all"} onValueChange={(value) => props.onEntryType(value === "all" ? "" : value as StatementMovementEntryType)} disabled={props.disabled}>
        <SelectTrigger className="w-full"><SelectValue placeholder="نوع الحركة" /></SelectTrigger>
        <SelectContent dir="rtl"><SelectItem value="all">كل أنواع الحركات</SelectItem>{typeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={props.direction || "all"} onValueChange={(value) => props.onDirection(value === "all" ? "" : value as StatementMovementDirection)} disabled={props.disabled}>
        <SelectTrigger className="w-full"><SelectValue placeholder="اتجاه الأثر" /></SelectTrigger>
        <SelectContent dir="rtl"><SelectItem value="all">كل الاتجاهات</SelectItem>{STATEMENT_MOVEMENT_DIRECTION_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
      <Input type="number" min="0" step="0.01" inputMode="decimal" dir="ltr" value={props.amountMin} onChange={(event) => props.onAmountMin(event.target.value)} placeholder="من مبلغ" disabled={props.disabled} />
      <Input type="number" min="0" step="0.01" inputMode="decimal" dir="ltr" value={props.amountMax} onChange={(event) => props.onAmountMax(event.target.value)} placeholder="إلى مبلغ" disabled={props.disabled} />
      {active ? <Button type="button" variant="ghost" size="sm" onClick={props.onClear} className="gap-1 text-muted-foreground"><X className="size-4" />مسح</Button> : <span />}
    </div>

    {props.amountRangeInvalid ? <p className="text-xs text-destructive">يجب أن يكون الحد الأعلى للمبلغ أكبر من أو مساوياً للحد الأدنى.</p> : null}

    {active ? <div className="flex flex-wrap items-center gap-2" aria-label="الفلاتر النشطة">
      <span className="text-xs font-medium text-muted-foreground">الفلاتر النشطة:</span>
      {props.search ? <FilterChip label={`البحث: ${props.search}`} onRemove={() => props.onSearch("")} /> : null}
      {typeLabel ? <FilterChip label={`نوع الحركة: ${typeLabel}`} onRemove={() => props.onEntryType("")} /> : null}
      {directionLabel ? <FilterChip label={`اتجاه الأثر: ${directionLabel}`} onRemove={() => props.onDirection("")} /> : null}
      {props.amountMin ? <FilterChip label={`من مبلغ: ${props.amountMin}`} onRemove={() => props.onAmountMin("")} /> : null}
      {props.amountMax ? <FilterChip label={`إلى مبلغ: ${props.amountMax}`} onRemove={() => props.onAmountMax("")} /> : null}
    </div> : null}
  </div>
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <Badge variant="secondary" className="gap-1 rounded-full py-1 pr-2 pl-1 font-normal"><span>{label}</span><button type="button" onClick={onRemove} className="rounded-full p-0.5 hover:bg-background/70" aria-label={`إزالة ${label}`}><X className="size-3" /></button></Badge>
}
