"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarRange, ChevronDown, Filter, Search, UserRound, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PatientSelectionDialog } from "@/components/patients/patient-selection-dialog"
import { usePatient } from "@/features/patients"
import { orderStatusOptions } from "./orders-helpers"

export interface OrdersFiltersValue {
  search: string
  status: (typeof orderStatusOptions)[number]["value"]
  patientId: number | "all"
  orderedFrom: string
  orderedTo: string
}

interface OrdersFiltersProps {
  value: OrdersFiltersValue
  onChange: (value: OrdersFiltersValue) => void
  isLoading?: boolean
}

export function OrdersFilters({ value, onChange, isLoading = false }: OrdersFiltersProps) {
  const [localSearch, setLocalSearch] = useState(value.search)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)
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
  }, [localSearch, value.status, value.patientId, value.orderedFrom, value.orderedTo])

  const selectedPatientId = value.patientId === "all" ? null : value.patientId
  const { patient: selectedPatient, isLoading: isLoadingSelectedPatient } = usePatient(selectedPatientId)

  const hasActiveFilters =
    Boolean(value.search.trim()) ||
    value.status !== "all" ||
    value.patientId !== "all" ||
    Boolean(value.orderedFrom) ||
    Boolean(value.orderedTo)

  const selectedStatusLabel =
    value.status === "all"
      ? undefined
      : orderStatusOptions.find((x) => x.value === value.status)?.label ?? value.status

  const selectedPatientLabel =
    value.patientId === "all"
      ? undefined
      : isLoadingSelectedPatient
        ? "جاري تحميل بيانات المريض..."
        : selectedPatient?.full_name ?? `#${value.patientId}`

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <PatientSelectionDialog
        open={patientDialogOpen}
        onOpenChange={setPatientDialogOpen}
        onSelect={(p) => {
          const id = Number(p.id)
          if (!Number.isNaN(id)) {
            onChange({ ...value, patientId: id })
          }
        }}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الطلب أو اسم الطبيب..."
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
              onClick={() => onChange({ search: "", status: "all", patientId: "all", orderedFrom: "", orderedTo: "" })}
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
          showAdvanced ? "max-h-[260px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 pb-2 pt-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">حالة الطلب</Label>
            <Select
              value={value.status}
              onValueChange={(selected) =>
                onChange({ ...value, status: selected as OrdersFiltersValue["status"] })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                {orderStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">المريض</Label>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 w-full justify-between gap-2 px-3 font-normal",
                value.patientId === "all" && "text-muted-foreground"
              )}
              onClick={() => setPatientDialogOpen(true)}
              disabled={isLoading}
            >
              <span className="flex min-w-0 items-center gap-2">
                <UserRound className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {value.patientId === "all" ? "اختيار المريض" : selectedPatientLabel}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">من تاريخ الطلب</Label>
            <Input
              type="date"
              value={value.orderedFrom}
              onChange={(e) => onChange({ ...value, orderedFrom: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">إلى تاريخ الطلب</Label>
            <Input
              type="date"
              value={value.orderedTo}
              onChange={(e) => onChange({ ...value, orderedTo: e.target.value })}
              disabled={isLoading}
            />
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

          {selectedStatusLabel ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              الحالة: {selectedStatusLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-emerald-200/80 dark:hover:bg-emerald-800"
                onClick={() => onChange({ ...value, status: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {selectedPatientLabel ? (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              المريض: {selectedPatientLabel}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-blue-200/80 dark:hover:bg-blue-800"
                onClick={() => onChange({ ...value, patientId: "all" })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}

          {value.orderedFrom || value.orderedTo ? (
            <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
              <CalendarRange className="h-3 w-3" />
              {value.orderedFrom || "..."} - {value.orderedTo || "..."}
              <button
                type="button"
                className="mr-1 rounded-full p-0.5 hover:bg-violet-200/80 dark:hover:bg-violet-800"
                onClick={() => onChange({ ...value, orderedFrom: "", orderedTo: "" })}
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
