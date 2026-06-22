"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, ChevronDown, Filter, Minus, Search, X } from "lucide-react"
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
import type { BalanceStatusFilter } from "@/features/suppliers"

export interface SuppliersFiltersValue {
  search: string
  isActive: SuppliersActiveStatus
  balanceStatus: BalanceStatusFilter | "all"
}

interface SuppliersFiltersProps {
  value: SuppliersFiltersValue
  onChange: (value: SuppliersFiltersValue) => void
  isLoading?: boolean
}

const DEBOUNCE_MS = 450

const BALANCE_DIRECTION_OPTIONS = [
  {
    value: "payable" as const,
    label: "عليه",
    icon: ArrowDownLeft,
    baseClass: "border-red-500/40 text-red-700 hover:bg-red-500/10 dark:text-red-300",
    activeClass: "border-red-500/60 bg-red-500/15 text-red-800 ring-1 ring-red-500/30 dark:bg-red-950/40",
  },
  {
    value: "credit" as const,
    label: "له",
    icon: ArrowUpRight,
    baseClass: "border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300",
    activeClass:
      "border-emerald-500/60 bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/30 dark:bg-emerald-950/40",
  },
  {
    value: "settled" as const,
    label: "متوازن",
    icon: Minus,
    baseClass: "border-amber-500/40 text-amber-800 hover:bg-amber-500/10 dark:text-amber-300",
    activeClass:
      "border-amber-500/60 bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/30 dark:bg-amber-950/40",
  },
] as const

export function SuppliersFilters({ value, onChange, isLoading = false }: SuppliersFiltersProps) {
  const [localSearch, setLocalSearch] = useState(value.search)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    setLocalSearch(value.search)
  }, [value.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch === valueRef.current.search) return
      onChangeRef.current({ ...valueRef.current, search: localSearch })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [localSearch])

  const hasActiveFilters =
    Boolean(value.search.trim()) || value.isActive !== "all" || value.balanceStatus !== "all"

  const statusLabel =
    value.isActive === "active"
      ? "فعال"
      : value.isActive === "inactive"
        ? "موقوف"
        : undefined

  const balanceStatusLabel =
    value.balanceStatus === "payable"
      ? "عليه"
      : value.balanceStatus === "credit"
        ? "له"
        : value.balanceStatus === "settled"
          ? "متوازن"
          : undefined

  const balanceBadgeClass =
    value.balanceStatus === "payable"
      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
      : value.balanceStatus === "credit"
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"

  const clearAll = () =>
    onChange({
      search: "",
      isActive: "all",
      balanceStatus: "all",
    })

  function toggleBalanceDirection(next: BalanceStatusFilter) {
    onChange({
      ...value,
      balanceStatus: value.balanceStatus === next ? "all" : next,
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
          showAdvanced ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-3 border-t border-border/60 pb-2 pt-4 md:flex-row md:items-center md:gap-4">
          <div className="flex min-w-0 items-center gap-2 md:w-44 md:shrink-0">
            <Label htmlFor="suppliers-filter-status" className="shrink-0 text-xs text-muted-foreground">
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

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:gap-3">
            <span className="shrink-0 text-xs text-muted-foreground">اتجاه الرصيد</span>
            {BALANCE_DIRECTION_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = value.balanceStatus === option.value
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => toggleBalanceDirection(option.value)}
                    className={cn(
                      "h-10 gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors",
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
            <Badge variant="secondary" className={balanceBadgeClass}>
              الرصيد: {balanceStatusLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => onChange({ ...value, balanceStatus: "all" })}
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
