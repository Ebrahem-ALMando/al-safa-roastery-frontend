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
import type { SuppliersActiveStatus } from "@/features/suppliers"

export interface SuppliersFiltersValue {
  search: string
  isActive: SuppliersActiveStatus
}

interface SuppliersFiltersProps {
  value: SuppliersFiltersValue
  onChange: (value: SuppliersFiltersValue) => void
  isLoading?: boolean
}

export function SuppliersFilters({ value, onChange, isLoading = false }: SuppliersFiltersProps) {
  const [localSearch, setLocalSearch] = useState(value.search)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    setLocalSearch(value.search)
  }, [value.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current({ ...value, search: localSearch })
    }, 450)
    return () => clearTimeout(timer)
  }, [localSearch, value.isActive])

  const hasActiveFilters =
    Boolean(value.search.trim()) || value.isActive !== "all"

  const statusLabel =
    value.isActive === "active"
      ? "فعال"
      : value.isActive === "inactive"
        ? "موقوف"
        : undefined

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم، الكود، الهاتف، الشخص المسؤول..."
            className="w-full pr-10"
            value={localSearch}
            disabled={isLoading}
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
              onClick={() => onChange({ search: "", isActive: "all" })}
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
          showAdvanced ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4">
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

          <div className="space-y-2 opacity-50" title="يتطلب دعم الخادم — راجع docs/suppliers-backend-polish-needed.md">
            <Label className="text-xs text-muted-foreground">حالة الرصيد</Label>
            <Select disabled value="all">
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 opacity-50" title="يتطلب دعم الخادم">
            <Label className="text-xs text-muted-foreground">من الرصيد</Label>
            <Input type="number" disabled placeholder="—" className="h-10" />
          </div>

          <div className="space-y-2 opacity-50" title="يتطلب دعم الخادم">
            <Label className="text-xs text-muted-foreground">إلى الرصيد</Label>
            <Input type="number" disabled placeholder="—" className="h-10" />
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
                onClick={() => onChange({ ...value, search: "" })}
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
        </div>
      ) : null}
    </div>
  )
}
