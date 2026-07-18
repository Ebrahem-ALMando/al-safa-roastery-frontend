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
  CASHBOX_DIRECTION_LABELS_AR,
  CASHBOX_PAYMENT_METHOD_LABELS_AR,
  CASHBOX_SOURCE_TYPE_OPTIONS,
  CASHBOX_TRANSACTION_TYPE_OPTIONS,
  type CashboxDirection,
  type CashboxPaymentMethod,
  type CashboxTransactionType,
} from "@/src/features/cashbox"

export type CashboxFiltersValue = {
  search: string
  direction: CashboxDirection | "all"
  sourceType: string
  paymentMethod: CashboxPaymentMethod | "all"
  transactionType: CashboxTransactionType | "all"
}

export function CashboxFilters({ value, onChange, onReset, isLoading = false }: {
  value: CashboxFiltersValue
  onChange: (value: CashboxFiltersValue) => void
  onReset: () => void
  isLoading?: boolean
}) {
  const [advanced, setAdvanced] = useState(false)
  const hasActive = Boolean(value.search.trim()) || value.direction !== "all" || value.sourceType !== "all" || value.paymentMethod !== "all" || value.transactionType !== "all"
  const sourceLabel = CASHBOX_SOURCE_TYPE_OPTIONS.find((option) => option.value === value.sourceType)?.label
  const transactionLabel = CASHBOX_TRANSACTION_TYPE_OPTIONS.find((option) => option.value === value.transactionType)?.label

  return <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={value.search} onChange={(event) => onChange({ ...value, search: event.target.value })} placeholder="ابحث بالرقم أو الوصف أو المرجع..." className="pr-10" />
      </div>
      <Button type="button" variant="outline" onClick={() => setAdvanced((current) => !current)} className="gap-2 bg-transparent"><Filter className="size-4" />بحث متقدم<ChevronDown className={cn("size-4 transition-transform", advanced && "rotate-180")} /></Button>
      {hasActive ? <Button type="button" variant="ghost" size="sm" onClick={onReset} className="h-10 gap-2 px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"><X className="size-4" />مسح الفلاتر</Button> : null}
    </div>

    <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", advanced ? "max-h-72 opacity-100" : "max-h-0 opacity-0")}>
      <div className="grid gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4 md:items-end">
        <FilterSelect label="نوع الحركة" value={value.direction} disabled={isLoading} onChange={(direction) => onChange({ ...value, direction: direction as CashboxDirection | "all" })} options={Object.entries(CASHBOX_DIRECTION_LABELS_AR).map(([optionValue, label]) => ({ value: optionValue, label }))} />
        <FilterSelect label="مصدر الحركة" value={value.sourceType} disabled={isLoading} onChange={(sourceType) => onChange({ ...value, sourceType })} options={CASHBOX_SOURCE_TYPE_OPTIONS} />
        <FilterSelect label="طريقة الدفع" value={value.paymentMethod} disabled={isLoading} onChange={(paymentMethod) => onChange({ ...value, paymentMethod: paymentMethod as CashboxPaymentMethod | "all" })} options={Object.entries(CASHBOX_PAYMENT_METHOD_LABELS_AR).map(([optionValue, label]) => ({ value: optionValue, label }))} />
        <FilterSelect label="تصنيف الحركة" value={value.transactionType} disabled={isLoading} onChange={(transactionType) => onChange({ ...value, transactionType: transactionType as CashboxTransactionType | "all" })} options={CASHBOX_TRANSACTION_TYPE_OPTIONS} />
      </div>
    </div>

    {hasActive ? <div className="flex flex-wrap items-center gap-2 pt-3">
      <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
      {value.search.trim() ? <FilterChip label={`البحث: ${value.search}`} onClear={() => onChange({ ...value, search: "" })} /> : null}
      {value.direction !== "all" ? <FilterChip label={`نوع الحركة: ${CASHBOX_DIRECTION_LABELS_AR[value.direction]}`} onClear={() => onChange({ ...value, direction: "all" })} /> : null}
      {sourceLabel ? <FilterChip label={`المصدر: ${sourceLabel}`} onClear={() => onChange({ ...value, sourceType: "all" })} /> : null}
      {value.paymentMethod !== "all" ? <FilterChip label={`طريقة الدفع: ${CASHBOX_PAYMENT_METHOD_LABELS_AR[value.paymentMethod]}`} onClear={() => onChange({ ...value, paymentMethod: "all" })} /> : null}
      {transactionLabel ? <FilterChip label={`التصنيف: ${transactionLabel}`} onClear={() => onChange({ ...value, transactionType: "all" })} /> : null}
    </div> : null}
  </div>
}

function FilterSelect({ label, value, disabled, onChange, options }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void; options: readonly { value: string; label: string }[] }) {
  return <div className="space-y-2"><Label className="text-xs text-muted-foreground">{label}</Label><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return <Badge variant="secondary" className="gap-1 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">{label}<button type="button" className="rounded-full p-0.5 hover:bg-sky-200/80" onClick={onClear} aria-label={`إزالة ${label}`}><X className="size-3" /></button></Badge>
}
