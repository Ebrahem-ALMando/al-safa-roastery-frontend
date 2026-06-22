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
import {
  PURCHASE_PAYMENT_METHOD_LABELS_AR,
  PURCHASE_PAYMENT_STATUS_LABELS_AR,
  PURCHASE_STATUS_LABELS_AR,
  type PurchasesPaymentMethodFilter,
  type PurchasesPaymentStatusFilter,
  type PurchasesStatusFilter,
} from "@/features/purchases"
import { SupplierPicker } from "./SupplierPicker"

export interface PurchasesFiltersValue {
  search: string
  status: PurchasesStatusFilter
  supplierId: number | null
  supplierName: string | null
  paymentStatus: PurchasesPaymentStatusFilter
  paymentMethod: PurchasesPaymentMethodFilter
}

interface PurchasesFiltersProps {
  value: PurchasesFiltersValue
  onChange: (value: PurchasesFiltersValue) => void
  isLoading?: boolean
}

const DEBOUNCE_MS = 450

export function PurchasesFilters({ value, onChange, isLoading = false }: PurchasesFiltersProps) {
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
    Boolean(value.search.trim()) ||
    value.status !== "all" ||
    value.supplierId != null ||
    value.paymentStatus !== "all" ||
    value.paymentMethod !== "all"

  const statusLabel = value.status !== "all" ? PURCHASE_STATUS_LABELS_AR[value.status] : undefined
  const paymentStatusLabel =
    value.paymentStatus !== "all" ? PURCHASE_PAYMENT_STATUS_LABELS_AR[value.paymentStatus] : undefined
  const paymentMethodLabel =
    value.paymentMethod !== "all" ? PURCHASE_PAYMENT_METHOD_LABELS_AR[value.paymentMethod] : undefined

  const clearAll = () => {
    onChange({
      search: "",
      status: "all",
      supplierId: null,
      supplierName: null,
      paymentStatus: "all",
      paymentMethod: "all",
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث برقم الفاتورة أو اسم المورد..."
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
            <Label htmlFor="purchases-filter-status" className="text-xs text-muted-foreground">
              حالة الفاتورة
            </Label>
            <Select
              value={value.status}
              onValueChange={(selected) =>
                onChange({ ...value, status: selected as PurchasesStatusFilter })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="purchases-filter-status" className="h-10 w-full">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="draft">{PURCHASE_STATUS_LABELS_AR.draft}</SelectItem>
                <SelectItem value="completed">{PURCHASE_STATUS_LABELS_AR.completed}</SelectItem>
                <SelectItem value="cancelled">{PURCHASE_STATUS_LABELS_AR.cancelled}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">المورد</Label>
            <SupplierPicker
              value={
                value.supplierId != null && value.supplierName
                  ? { id: value.supplierId, name: value.supplierName }
                  : null
              }
              onChange={(picked) =>
                onChange({
                  ...value,
                  supplierId: picked?.id ?? null,
                  supplierName: picked?.name ?? null,
                })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchases-filter-payment-status" className="text-xs text-muted-foreground">
              حالة الدفع
            </Label>
            <Select
              value={value.paymentStatus}
              onValueChange={(selected) =>
                onChange({ ...value, paymentStatus: selected as PurchasesPaymentStatusFilter })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="purchases-filter-payment-status" className="h-10 w-full">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="unpaid">{PURCHASE_PAYMENT_STATUS_LABELS_AR.unpaid}</SelectItem>
                <SelectItem value="partial">{PURCHASE_PAYMENT_STATUS_LABELS_AR.partial}</SelectItem>
                <SelectItem value="paid">{PURCHASE_PAYMENT_STATUS_LABELS_AR.paid}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchases-filter-payment-method" className="text-xs text-muted-foreground">
              طريقة الدفع
            </Label>
            <Select
              value={value.paymentMethod}
              onValueChange={(selected) =>
                onChange({ ...value, paymentMethod: selected as PurchasesPaymentMethodFilter })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="purchases-filter-payment-method" className="h-10 w-full">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="cash">{PURCHASE_PAYMENT_METHOD_LABELS_AR.cash}</SelectItem>
                <SelectItem value="sham_cash">{PURCHASE_PAYMENT_METHOD_LABELS_AR.sham_cash}</SelectItem>
                <SelectItem value="bank_transfer">
                  {PURCHASE_PAYMENT_METHOD_LABELS_AR.bank_transfer}
                </SelectItem>
                <SelectItem value="other">{PURCHASE_PAYMENT_METHOD_LABELS_AR.other}</SelectItem>
              </SelectContent>
            </Select>
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
            <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
              الحالة: {statusLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-slate-200/80"
                onClick={() => onChange({ ...value, status: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {value.supplierName ? (
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
              المورد: {value.supplierName}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-teal-200/80"
                onClick={() => onChange({ ...value, supplierId: null, supplierName: null })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {paymentStatusLabel ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              الدفع: {paymentStatusLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-amber-200/80"
                onClick={() => onChange({ ...value, paymentStatus: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {paymentMethodLabel ? (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              الطريقة: {paymentMethodLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-blue-200/80"
                onClick={() => onChange({ ...value, paymentMethod: "all" })}
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
