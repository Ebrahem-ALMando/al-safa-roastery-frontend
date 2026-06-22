"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Filter, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ItemsActiveStatus, ItemsStockStatusFilter, ItemsTypeFilter } from "@/features/items"
import { ITEM_TYPE_LABELS_AR, STOCK_STATUS_FILTER_LABELS_AR } from "@/features/items"

export interface ItemsFiltersValue {
  search: string
  isActive: ItemsActiveStatus
  itemType: ItemsTypeFilter
  stockStatus: ItemsStockStatusFilter
  quantityMin: string
  quantityMax: string
}

interface ItemsFiltersProps {
  value: ItemsFiltersValue
  onChange: (value: ItemsFiltersValue) => void
  isLoading?: boolean
}

const DEBOUNCE_MS = 450

export function ItemsFilters({ value, onChange, isLoading = false }: ItemsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(value.search)
  const [localQuantityMin, setLocalQuantityMin] = useState(value.quantityMin)
  const [localQuantityMax, setLocalQuantityMax] = useState(value.quantityMax)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    setLocalSearch(value.search)
  }, [value.search])

  useEffect(() => {
    setLocalQuantityMin(value.quantityMin)
  }, [value.quantityMin])

  useEffect(() => {
    setLocalQuantityMax(value.quantityMax)
  }, [value.quantityMax])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch === valueRef.current.search) return
      onChangeRef.current({ ...valueRef.current, search: localSearch })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [localSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        localQuantityMin === valueRef.current.quantityMin &&
        localQuantityMax === valueRef.current.quantityMax
      ) {
        return
      }
      onChangeRef.current({
        ...valueRef.current,
        quantityMin: localQuantityMin,
        quantityMax: localQuantityMax,
      })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [localQuantityMin, localQuantityMax])

  const hasQuantityRange = value.quantityMin.trim() !== "" || value.quantityMax.trim() !== ""

  const hasActiveFilters =
    Boolean(value.search.trim()) ||
    value.isActive !== "all" ||
    value.itemType !== "all" ||
    value.stockStatus !== "all" ||
    hasQuantityRange

  const statusLabel =
    value.isActive === "active"
      ? "فعال"
      : value.isActive === "inactive"
        ? "موقوف"
        : undefined

  const itemTypeLabel =
    value.itemType !== "all" ? ITEM_TYPE_LABELS_AR[value.itemType] : undefined

  const stockStatusLabel =
    value.stockStatus !== "all" ? STOCK_STATUS_FILTER_LABELS_AR[value.stockStatus] : undefined

  const clearAll = () => {
    setLocalQuantityMin("")
    setLocalQuantityMax("")
    onChange({
      search: "",
      isActive: "all",
      itemType: "all",
      stockStatus: "all",
      quantityMin: "",
      quantityMax: "",
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو الكود..."
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
          showAdvanced ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4 md:items-end">
          <div className="space-y-2">
            <Label htmlFor="items-filter-status" className="text-xs text-muted-foreground">
              الحالة
            </Label>
            <Select
              value={value.isActive}
              onValueChange={(selected) =>
                onChange({
                  ...value,
                  isActive: selected as ItemsActiveStatus,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="items-filter-status" className="h-10 w-full">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="items-filter-type" className="text-xs text-muted-foreground">
              نوع الصنف
            </Label>
            <Select
              value={value.itemType}
              onValueChange={(selected) =>
                onChange({
                  ...value,
                  itemType: selected as ItemsTypeFilter,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="items-filter-type" className="h-10 w-full">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="raw">{ITEM_TYPE_LABELS_AR.raw}</SelectItem>
                <SelectItem value="ready">{ITEM_TYPE_LABELS_AR.ready}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="items-filter-stock-status" className="text-xs text-muted-foreground">
              حالة المخزون
            </Label>
            <Select
              value={value.stockStatus}
              onValueChange={(selected) =>
                onChange({
                  ...value,
                  stockStatus: selected as ItemsStockStatusFilter,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="items-filter-stock-status" className="h-10 w-full">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="reorder_required">
                  {STOCK_STATUS_FILTER_LABELS_AR.reorder_required}
                </SelectItem>
                <SelectItem value="available">{STOCK_STATUS_FILTER_LABELS_AR.available}</SelectItem>
                <SelectItem value="low">{STOCK_STATUS_FILTER_LABELS_AR.low}</SelectItem>
                <SelectItem value="out_of_stock">{STOCK_STATUS_FILTER_LABELS_AR.out_of_stock}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">نطاق الكمية</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="items-filter-quantity-min"
                type="number"
                min={0}
                step="0.001"
                placeholder="من (كغ)"
                className="h-10 min-w-0"
                value={localQuantityMin}
                onChange={(e) => setLocalQuantityMin(e.target.value)}
                dir="ltr"
              />
              <Input
                id="items-filter-quantity-max"
                type="number"
                min={0}
                step="0.001"
                placeholder="إلى (كغ)"
                className="h-10 min-w-0"
                value={localQuantityMax}
                onChange={(e) => setLocalQuantityMax(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>

          {value.search.trim() ? (
            <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
              البحث: {value.search}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-violet-200/80 dark:hover:bg-violet-800"
                onClick={() => {
                  setLocalSearch("")
                  onChange({ ...value, search: "" })
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {statusLabel ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              الحالة: {statusLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-emerald-200/80 dark:hover:bg-emerald-800"
                onClick={() => onChange({ ...value, isActive: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {itemTypeLabel ? (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              النوع: {itemTypeLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-blue-200/80 dark:hover:bg-blue-800"
                onClick={() => onChange({ ...value, itemType: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {stockStatusLabel ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              المخزون: {stockStatusLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-amber-200/80 dark:hover:bg-amber-800"
                onClick={() => onChange({ ...value, stockStatus: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {hasQuantityRange ? (
            <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              نطاق الكمية: {value.quantityMin || "…"} — {value.quantityMax || "…"} كغ
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-sky-200/80 dark:hover:bg-sky-800"
                onClick={() => {
                  setLocalQuantityMin("")
                  setLocalQuantityMax("")
                  onChange({
                    ...value,
                    quantityMin: "",
                    quantityMax: "",
                  })
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
