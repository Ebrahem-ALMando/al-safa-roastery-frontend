"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, ChevronDown, Filter, Loader2, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  PRODUCT_PRICE_STATUS_LABELS_AR,
  PRODUCT_STOCK_STATUS_LABELS_AR,
  type ProductsActiveStatus,
  type ProductsPriceStatusFilter,
  type ProductsStockStatusFilter,
} from "@/features/products"
import { useItemPickerList } from "@/features/purchases/hooks/useItemPickerList"

export interface ProductsFiltersValue {
  search: string
  isActive: ProductsActiveStatus
  priceStatus: ProductsPriceStatusFilter
  stockStatus: ProductsStockStatusFilter
  linkedItemId: number | null
  linkedItemLabel: string
}

type ProductsFiltersProps = {
  value: ProductsFiltersValue
  onChange: (value: ProductsFiltersValue) => void
  isLoading?: boolean
}

const DEBOUNCE_MS = 450

export function ProductsFilters({ value, onChange, isLoading = false }: ProductsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(value.search)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [itemPickerOpen, setItemPickerOpen] = useState(false)
  const [itemQuery, setItemQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch === value.search) return
      onChange({ ...value, search: localSearch })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [localSearch, onChange, value])

  const { rows, isLoading: itemLoading, error: itemError } = useItemPickerList({
    open: itemPickerOpen,
    search: itemQuery,
  })

  const statusLabel =
    value.isActive === "active" ? "فعال" : value.isActive === "inactive" ? "موقوف" : undefined
  const priceStatusLabel =
    value.priceStatus !== "all" ? PRODUCT_PRICE_STATUS_LABELS_AR[value.priceStatus] : undefined
  const stockStatusLabel =
    value.stockStatus !== "all" ? PRODUCT_STOCK_STATUS_LABELS_AR[value.stockStatus] : undefined

  const hasActiveFilters =
    Boolean(value.search.trim()) ||
    value.isActive !== "all" ||
    value.priceStatus !== "all" ||
    value.stockStatus !== "all" ||
    value.linkedItemId != null

  function clearAll() {
    setLocalSearch("")
    setItemQuery("")
    onChange({
      search: "",
      isActive: "all",
      priceStatus: "all",
      stockStatus: "all",
      linkedItemId: null,
      linkedItemLabel: "",
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث باسم المنتج أو الكود..."
            className="w-full pr-10"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => setShowAdvanced((prev) => !prev)}
            type="button"
          >
            <Filter className="h-4 w-4" />
            بحث متقدم
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
          </Button>
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              type="button"
            >
              <X className="ml-1 h-4 w-4" />
              مسح الفلاتر
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showAdvanced ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4 md:items-end">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">الحالة</Label>
            <Select
              value={value.isActive}
              disabled={isLoading}
              onValueChange={(selected) => onChange({ ...value, isActive: selected as ProductsActiveStatus })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">حالة التسعير</Label>
            <Select
              value={value.priceStatus}
              disabled={isLoading}
              onValueChange={(selected) =>
                onChange({ ...value, priceStatus: selected as ProductsPriceStatusFilter })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="priced">مسعّر</SelectItem>
                <SelectItem value="unpriced">بدون سعر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">حالة المخزون</Label>
            <Select
              value={value.stockStatus}
              disabled={isLoading}
              onValueChange={(selected) =>
                onChange({ ...value, stockStatus: selected as ProductsStockStatusFilter })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="reorder_required">يحتاج إعادة طلب</SelectItem>
                <SelectItem value="available">متوفر</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="out_of_stock">نافد</SelectItem>
                <SelectItem value="unlinked">غير مرتبط بصنف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">الصنف المرتبط</Label>
            <Popover open={itemPickerOpen} onOpenChange={setItemPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="h-10 w-full justify-between rounded-md font-normal"
                  disabled={isLoading}
                >
                  <span className="truncate">{value.linkedItemLabel || "اختر صنفاً..."}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[320px] p-0" dir="rtl">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="ابحث باسم الصنف أو الكود..."
                    value={itemQuery}
                    onValueChange={setItemQuery}
                  />
                  <CommandList>
                    {itemLoading ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        جاري التحميل
                      </div>
                    ) : itemError ? (
                      <CommandEmpty>تعذر تحميل الأصناف.</CommandEmpty>
                    ) : rows.length === 0 ? (
                      <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {rows.map((row) => {
                          const id = Number.parseInt(row.id, 10)
                          const selected = value.linkedItemId === id
                          return (
                            <CommandItem
                              key={row.id}
                              value={row.id}
                              onSelect={() => {
                                onChange({
                                  ...value,
                                  linkedItemId: id,
                                  linkedItemLabel: `${row.name}${row.code !== "—" ? ` · ${row.code}` : ""}`,
                                })
                                setItemPickerOpen(false)
                              }}
                              className="flex-row-reverse justify-between text-right"
                            >
                              <span className="truncate">
                                {row.name}
                                <span className="mr-2 font-mono text-xs text-muted-foreground" dir="ltr">
                                  {row.code}
                                </span>
                              </span>
                              <Check className={cn("size-4", selected ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
          {value.search.trim() ? (
            <FilterChip
              label={`البحث: ${value.search}`}
              onClear={() => {
                setLocalSearch("")
                onChange({ ...value, search: "" })
              }}
            />
          ) : null}
          {statusLabel ? <FilterChip label={`الحالة: ${statusLabel}`} onClear={() => onChange({ ...value, isActive: "all" })} /> : null}
          {priceStatusLabel ? <FilterChip label={`التسعير: ${priceStatusLabel}`} onClear={() => onChange({ ...value, priceStatus: "all" })} /> : null}
          {stockStatusLabel ? <FilterChip label={`المخزون: ${stockStatusLabel}`} onClear={() => onChange({ ...value, stockStatus: "all" })} /> : null}
          {value.linkedItemId != null ? (
            <FilterChip
              label={`الصنف: ${value.linkedItemLabel || value.linkedItemId}`}
              onClear={() => onChange({ ...value, linkedItemId: null, linkedItemLabel: "" })}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
      {label}
      <button type="button" className="mr-1 rounded-full p-0.5 hover:bg-sky-200/80" onClick={onClear}>
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}
