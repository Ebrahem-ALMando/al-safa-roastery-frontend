"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Filter, Package, Search, X } from "lucide-react"
import { ItemPickerDialog } from "@/components/purchases/editor/ItemPickerDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PRODUCTION_STATUS_LABELS_AR, type ProductionFilterItem, type ProductionStatus } from "@/src/features/production"
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"

export type ProductionFiltersValue = { search: string; status: ProductionStatus | "all"; outputItem: ProductionFilterItem | null; inputItems: ProductionFilterItem[]; quantityMin: string; quantityMax: string }
const itemLabel = (item: ItemPickerRow) => `${item.name}${item.code !== "—" ? ` · ${item.code}` : ""}`

export function ProductionFilters({ value, onChange, isLoading }: { value: ProductionFiltersValue; onChange: (value: ProductionFiltersValue) => void; isLoading?: boolean }) {
  const [localSearch, setLocalSearch] = useState(value.search)
  const [advanced, setAdvanced] = useState(() => value.status !== "all" || Boolean(value.outputItem) || value.inputItems.length > 0 || Boolean(value.quantityMin || value.quantityMax))
  const [outputOpen, setOutputOpen] = useState(false)
  const [inputsOpen, setInputsOpen] = useState(false)
  useEffect(() => { const timer = window.setTimeout(() => { if (localSearch !== value.search) onChange({ ...value, search: localSearch }) }, 450); return () => window.clearTimeout(timer) }, [localSearch, onChange, value])
  const active = Boolean(value.search.trim() || value.status !== "all" || value.outputItem || value.inputItems.length || value.quantityMin || value.quantityMax)
  const clear = () => { setLocalSearch(""); onChange({ search: "", status: "all", outputItem: null, inputItems: [], quantityMin: "", quantityMax: "" }) }
  const addInputs = (rows: ItemPickerRow[]) => onChange({ ...value, inputItems: [...value.inputItems, ...rows.filter((row) => !value.inputItems.some((item) => item.id === Number(row.id))).map((row) => ({ id: Number(row.id), label: itemLabel(row) }))] })

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="ابحث برقم العملية أو الصنف الناتج..." className="pr-10" /></div>
        <div className="flex gap-2"><Button type="button" variant="outline" className="gap-2" onClick={() => setAdvanced((current) => !current)}><Filter className="size-4" />بحث متقدم<ChevronDown className={cn("size-4 transition-transform", advanced && "rotate-180")} /></Button>{active ? <Button type="button" variant="ghost" className="text-rose-600" onClick={clear}><X className="size-4" />مسح الفلاتر</Button> : null}</div>
      </div>
      <div className={cn("overflow-hidden transition-all", advanced ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0")}>
        <div className="grid gap-4 border-t pt-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الحالة</Label><Select value={value.status} disabled={isLoading} onValueChange={(status) => onChange({ ...value, status: status as ProductionStatus | "all" })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{Object.entries(PRODUCTION_STATUS_LABELS_AR).map(([status, label]) => <SelectItem key={status} value={status}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الصنف الناتج</Label><Button type="button" variant="outline" className="w-full justify-between" onClick={() => setOutputOpen(true)}><span className="truncate">{value.outputItem?.label ?? "اختر الصنف الناتج"}</span><Package className="size-4" /></Button></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">الأصناف الداخلة</Label><Button type="button" variant="outline" className="w-full justify-between" onClick={() => setInputsOpen(true)}><span>{value.inputItems.length ? `${value.inputItems.length} محدد` : "اختر المواد الداخلة"}</span><Package className="size-4" /></Button></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">من كمية</Label><Input value={value.quantityMin} onChange={(event) => onChange({ ...value, quantityMin: event.target.value })} inputMode="decimal" dir="ltr" placeholder="0.000" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">إلى كمية</Label><Input value={value.quantityMax} onChange={(event) => onChange({ ...value, quantityMax: event.target.value })} inputMode="decimal" dir="ltr" placeholder="0.000" /></div>
        </div>
      </div>
      {active ? <div className="flex flex-wrap gap-2 border-t pt-3">{value.status !== "all" ? <Badge variant="secondary" className="gap-1">الحالة: {PRODUCTION_STATUS_LABELS_AR[value.status]}<button onClick={() => onChange({ ...value, status: "all" })}><X className="size-3" /></button></Badge> : null}{value.outputItem ? <Badge variant="secondary" className="gap-1">الناتج: {value.outputItem.label}<button onClick={() => onChange({ ...value, outputItem: null })}><X className="size-3" /></button></Badge> : null}{value.inputItems.map((item) => <Badge key={item.id} variant="outline" className="gap-1">{item.label}<button onClick={() => onChange({ ...value, inputItems: value.inputItems.filter((current) => current.id !== item.id) })}><X className="size-3" /></button></Badge>)}</div> : null}
      <ItemPickerDialog open={outputOpen} onOpenChange={setOutputOpen} onSelect={(row) => onChange({ ...value, outputItem: { id: Number(row.id), label: itemLabel(row) } })} selectionMode="single" variant="operation" selectedItemId={value.outputItem?.id} searchMode="local" itemType="ready" activeOnly title="اختيار الصنف الناتج" description="ابحث بالاسم أو الكود ثم اختر الصنف الجاهز الناتج." singleSelectionHint="اختر صنفاً جاهزاً واحداً لتصفية عمليات الإنتاج." />
      <ItemPickerDialog open={inputsOpen} onOpenChange={setInputsOpen} onSelect={(row) => addInputs([row])} onSelectMany={addInputs} selectionMode="multiple" searchMode="local" itemType="raw" activeOnly excludeItemIds={value.inputItems.map((item) => item.id)} title="اختيار الأصناف الداخلة" description="اختر مادة خام واحدة أو أكثر لتصفية عمليات الإنتاج." />
    </div>
  )
}
