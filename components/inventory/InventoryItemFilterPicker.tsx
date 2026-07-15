"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { cn } from "@/lib/utils"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { InventoryMovementPickerItem } from "@/src/features/inventory"

export function InventoryItemFilterPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: InventoryMovementPickerItem | number | null
  onChange: (item: InventoryMovementPickerItem | null) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activated, setActivated] = useState(false)
  const [query, setQuery] = useState("")
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const result = useApiQuery<InventoryMovementPickerItem[]>(
    activated && !authLoading && isAuthenticated ? "inventory-item-filter-picker" : null,
    "items/picker",
    { queryParams: { is_active: 1, limit: 1000 } }
  )
  const items = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar")
    if (!normalized) return result.data ?? []
    return (result.data ?? []).filter((item) =>
      `${item.name} ${item.code}`.toLocaleLowerCase("ar").includes(normalized)
    )
  }, [result.data, query])
  const selected = typeof value === "number"
    ? (result.data ?? []).find((item) => item.id === value) ?? null
    : value

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) setActivated(true) }}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="h-10 w-full justify-between font-normal" disabled={disabled}>
          <span className="truncate">{selected ? `${selected.name} · ${selected.code}` : value ? `الصنف #${value}` : "كل الأصناف"}</span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-2" dir="rtl">
        <div className="relative mb-2">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو الكود..." className="pr-9" />
        </div>
        <div className="max-h-64 overflow-y-auto">
          <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm hover:bg-muted" onClick={() => { onChange(null); setOpen(false) }}>
            <Check className={cn("size-4", value === null ? "opacity-100" : "opacity-0")} />
            كل الأصناف
          </button>
          {result.isLoading ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="my-2 h-10 w-full" />) : null}
          {result.error ? <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-destructive"><AlertCircle className="size-4" />تعذر تحميل الأصناف.</div> : null}
          {!result.isLoading && !result.error && items.length === 0 ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">لا توجد أصناف مطابقة.</p> : null}
          {!result.isLoading && !result.error ? items.map((item) => (
            <button key={item.id} type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm hover:bg-muted" onClick={() => { onChange(item); setOpen(false) }}>
              <Check className={cn("size-4", selected?.id === item.id ? "opacity-100" : "opacity-0")} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.name}</span>
                <span className="font-mono text-xs text-muted-foreground" dir="ltr">{item.code}</span>
              </span>
            </button>
          )) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
