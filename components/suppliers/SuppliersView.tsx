"use client"

import { useState } from "react"
import { LayoutGrid, Plus, RefreshCw, Settings2, Table } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { DateRangeDialog } from "@/components/shared/DateRangeDialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { defaultCustomPeriod } from "@/features/suppliers/lib/suppliers.helpers"
import {
  useSupplierActions,
  useSuppliersPage,
  type Supplier,
} from "@/features/suppliers"
import { SuppliersDataView } from "./SuppliersDataView"
import { SuppliersFilters } from "./SuppliersFilters"
import { SuppliersPeriodControls } from "./SuppliersPeriodControls"
import { SuppliersSummary } from "./SuppliersSummary"
import { SupplierColumnCustomizer } from "./SupplierColumnCustomizer"
import { SupplierDetailsDialog } from "./SupplierDetailsDialog"
import { SupplierFormDialog } from "./SupplierFormDialog"
import { SupplierDeleteDialog } from "./SupplierDeleteDialog"

export function SuppliersView() {
  const {
    periodPreset,
    setPeriodPreset,
    customPeriod,
    customDialogOpen,
    setCustomDialogOpen,
    applyCustomPeriod,
    dateRange,
    search,
    setSearch,
    isActive,
    setIsActive,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    suppliers,
    meta,
    isLoading,
    error,
    mutate,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  } = useSuppliersPage()

  const { createSupplier, updateSupplier, deleteSupplier, toggleSupplierActive } =
    useSupplierActions()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsSupplier, setDetailsSupplier] = useState<Supplier | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)

  function openCreate() {
    setFormMode("create")
    setEditSupplier(null)
    setFormOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setFormMode("edit")
    setEditSupplier(supplier)
    setFormOpen(true)
  }

  function openDetails(supplier: Supplier) {
    setDetailsSupplier(supplier)
    setDetailsOpen(true)
  }

  function openDelete(supplier: Supplier) {
    setDeleteTarget(supplier)
    setDeleteOpen(true)
  }

  const customFrom = customPeriod?.from ?? defaultCustomPeriod().from
  const customTo = customPeriod?.to ?? defaultCustomPeriod().to

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            الموردون
            /
            <p className="text-md text-muted-foreground">إدارة بيانات الموردين</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <SuppliersPeriodControls preset={periodPreset} onPresetChange={setPeriodPreset} />
          <Button onClick={openCreate} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            إضافة مورد
          </Button>
          <SupplierColumnCustomizer
            visibleColumns={visibleColumns}
            onChange={setColumnVisibility}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Settings2 className="h-4 w-4" />
                تخصيص الصفحة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>خيارات العرض</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={config.showKPI}
                onCheckedChange={(checked) => toggleShowKPI(Boolean(checked))}
              >
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={config.showFilters}
                onCheckedChange={(checked) => toggleShowFilters(Boolean(checked))}
              >
                إظهار الفلاتر
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant={config.viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className={cn("gap-2", config.viewMode === "cards" && "bg-primary text-primary-foreground")}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">بطاقات</span>
            </Button>
            <Button
              variant={config.viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className={cn("gap-2", config.viewMode === "table" && "bg-primary text-primary-foreground")}
              onClick={() => setViewMode("table")}
            >
              <Table className="h-4 w-4" />
              <span className="hidden sm:inline">جدول</span>
            </Button>
          </div>
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? <SuppliersSummary dateRange={dateRange} isLoading={isLoading} /> : null}

      {config.showFilters ? (
        <SuppliersFilters
          value={{ search, isActive }}
          onChange={(next) => {
            setSearch(next.search)
            setIsActive(next.isActive)
          }}
          isLoading={isLoading}
        />
      ) : null}

      {error && !isLoading ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-center text-sm text-muted-foreground" role="status">
            تعذر تحميل البيانات. حاول مرة أخرى.
          </p>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => void mutate()}>
            <RefreshCw className="size-4" />
            إعادة المحاولة
          </Button>
        </div>
      ) : null}

      <div
        className={
          config.viewMode === "cards"
            ? "overflow-hidden"
            : "overflow-hidden rounded-xl border border-border/60 shadow-sm"
        }
      >
        <SuppliersDataView
          viewMode={config.viewMode}
          suppliers={suppliers}
          meta={meta}
          visibleColumns={visibleColumns}
          isLoading={isLoading}
          isFilteredNoHits={isFilteredNoHits}
          isTrueEmpty={isTrueEmpty}
          currentPage={currentPage}
          lastPage={lastPage}
          canPrev={canPrev}
          canNext={canNext}
          onPageChange={setPage}
          onAddSupplier={openCreate}
          onViewDetails={openDetails}
          onEdit={openEdit}
          onDelete={openDelete}
          onToggleActive={async (supplier) => {
            await toggleSupplierActive(supplier)
            void mutate()
          }}
        />
      </div>

      <DateRangeDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        from={customFrom}
        to={customTo}
        onApply={applyCustomPeriod}
      />

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditSupplier(null)
        }}
        mode={formMode}
        supplier={editSupplier}
        onCreate={createSupplier}
        onUpdate={updateSupplier}
        onSaved={() => void mutate()}
      />

      <SupplierDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) setDetailsSupplier(null)
        }}
        supplierId={detailsSupplier?.id ?? null}
        fallbackSupplier={detailsSupplier}
        onEdit={openEdit}
      />

      <SupplierDeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        supplier={deleteTarget}
        onDelete={async (id) => {
          await deleteSupplier(id)
          void mutate()
        }}
      />
    </div>
  )
}
