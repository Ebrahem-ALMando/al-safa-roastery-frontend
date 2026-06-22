"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, ChevronDown, Filter, Search, X } from "lucide-react"
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
import type { SuppliersActiveStatus } from "@/features/suppliers"
import type { BalanceRangeDirection, BalanceStatusFilter } from "@/features/suppliers"

export interface SuppliersFiltersValue {
  search: string
  isActive: SuppliersActiveStatus
  balanceStatus: BalanceStatusFilter | "all"
  balanceMin: string
  balanceMax: string
  balanceRangeDirection: BalanceRangeDirection | null
}

interface SuppliersFiltersProps {
  value: SuppliersFiltersValue
  onChange: (value: SuppliersFiltersValue) => void
  isLoading?: boolean
}

const DEBOUNCE_MS = 450

const RANGE_DIRECTION_OPTIONS = [
  {
    value: "credit" as const,
    label: "عليه",
    icon: ArrowUpRight,
    baseClass: "border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300",
    activeClass:
      "border-emerald-500/60 bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/30 dark:bg-emerald-950/40",
  },
  {
    value: "payable" as const,
    label: "له",
    icon: ArrowDownLeft,
    baseClass: "border-red-500/40 text-red-700 hover:bg-red-500/10 dark:text-red-300",
    activeClass: "border-red-500/60 bg-red-500/15 text-red-800 ring-1 ring-red-500/30 dark:bg-red-950/40",
  },
] as const

export function SuppliersFilters({ value, onChange, isLoading = false }: SuppliersFiltersProps) {
  const [localSearch, setLocalSearch] = useState(value.search)
  const [localBalanceMin, setLocalBalanceMin] = useState(value.balanceMin)
  const [localBalanceMax, setLocalBalanceMax] = useState(value.balanceMax)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    setLocalSearch(value.search)
  }, [value.search])

  useEffect(() => {
    setLocalBalanceMin(value.balanceMin)
  }, [value.balanceMin])

  useEffect(() => {
    setLocalBalanceMax(value.balanceMax)
  }, [value.balanceMax])

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
        localBalanceMin === valueRef.current.balanceMin &&
        localBalanceMax === valueRef.current.balanceMax
      ) {
        return
      }
      onChangeRef.current({
        ...valueRef.current,
        balanceMin: localBalanceMin,
        balanceMax: localBalanceMax,
      })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [localBalanceMin, localBalanceMax])

  const hasBalanceRange = value.balanceMin.trim() !== "" || value.balanceMax.trim() !== ""

  const hasActiveFilters =
    Boolean(value.search.trim()) ||
    value.isActive !== "all" ||
    value.balanceStatus !== "all" ||
    hasBalanceRange

  const statusLabel =
    value.isActive === "active"
      ? "فعال"
      : value.isActive === "inactive"
        ? "موقوف"
        : undefined

  const balanceStatusLabel =
    value.balanceStatus === "payable"
      ? "مديونية (علينا)"
      : value.balanceStatus === "credit"
        ? "دائن (لنا)"
        : value.balanceStatus === "settled"
          ? "متوازن"
          : undefined

  const clearAll = () => {
    setLocalBalanceMin("")
    setLocalBalanceMax("")
    onChange({
      search: "",
      isActive: "all",
      balanceStatus: "all",
      balanceMin: "",
      balanceMax: "",
      balanceRangeDirection: null,
    })
  }

  function selectRangeDirection(next: BalanceRangeDirection) {
    onChange({
      ...value,
      balanceRangeDirection: value.balanceRangeDirection === next ? null : next,
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم، الكود، الهاتف، الشخص المسؤول..."
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
            <Label htmlFor="suppliers-filter-status" className="text-xs text-muted-foreground">
              الحالة
            </Label>
            <Select
              value={value.isActive}
              onValueChange={(selected) =>
                onChange({
                  ...value,
                  isActive: selected as SuppliersActiveStatus,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="suppliers-filter-status" className="h-10 w-full">
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
            <Label htmlFor="suppliers-filter-balance-status" className="text-xs text-muted-foreground">
              حالة الرصيد
            </Label>
            <Select
              value={value.balanceStatus}
              onValueChange={(selected) =>
                onChange({
                  ...value,
                  balanceStatus: selected as BalanceStatusFilter | "all",
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="suppliers-filter-balance-status" className="h-10 w-full">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="payable">مديونية (علينا)</SelectItem>
                <SelectItem value="credit">دائن (لنا)</SelectItem>
                <SelectItem value="settled">متوازن</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs text-muted-foreground">نطاق الرصيد</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Input
                id="suppliers-filter-balance-min"
                type="number"
                min={0}
                placeholder="من"
                className="h-10 min-w-0"
                value={localBalanceMin}
                onChange={(e) => setLocalBalanceMin(e.target.value)}
                dir="ltr"
              />
              <Input
                id="suppliers-filter-balance-max"
                type="number"
                min={0}
                placeholder="إلى"
                className="h-10 min-w-0"
                value={localBalanceMax}
                onChange={(e) => setLocalBalanceMax(e.target.value)}
                dir="ltr"
              />
              {RANGE_DIRECTION_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = value.balanceRangeDirection === option.value
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => selectRangeDirection(option.value)}
                    className={cn(
                      "h-10 w-full gap-1.5 rounded-xl border px-2 text-sm font-medium transition-colors",
                      selected ? option.activeClass : option.baseClass
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {option.label}
                  </Button>
                )
              })}
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

          {balanceStatusLabel ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              الرصيد: {balanceStatusLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-amber-200/80 dark:hover:bg-amber-800"
                onClick={() => onChange({ ...value, balanceStatus: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {hasBalanceRange ? (
            <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              نطاق: {value.balanceMin || "…"} — {value.balanceMax || "…"}
              {value.balanceRangeDirection === "credit"
                ? " (عليه — لنا)"
                : value.balanceRangeDirection === "payable"
                  ? " (له — علينا)"
                  : ""}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-sky-200/80 dark:hover:bg-sky-800"
                onClick={() => {
                  setLocalBalanceMin("")
                  setLocalBalanceMax("")
                  onChange({
                    ...value,
                    balanceMin: "",
                    balanceMax: "",
                    balanceRangeDirection: null,
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
