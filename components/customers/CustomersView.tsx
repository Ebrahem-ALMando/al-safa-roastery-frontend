"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { defaultCustomPeriod } from "@/features/customers/lib/customers.helpers"
import {
  useCustomerActions,
  useCustomersPage,
  type Customer,
} from "@/features/customers"
import { CustomersDataView } from "./CustomersDataView"
import { CustomersFilters } from "./CustomersFilters"
import { CustomersPeriodControls } from "./CustomersPeriodControls"
import { CustomersSummary } from "./CustomersSummary"
import { CustomerColumnCustomizer } from "./CustomerColumnCustomizer"
import { CustomerFormDialog } from "./CustomerFormDialog"
import { CustomerDeleteDialog } from "./CustomerDeleteDialog"
import { CustomerToggleActiveDialog } from "./CustomerToggleActiveDialog"

export function CustomersView() {
  const router = useRouter()
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
    customerType,
    setCustomerType,
    balanceStatus,
    setBalanceStatus,
    balanceMin,
    setBalanceMin,
    balanceMax,
    setBalanceMax,
    balanceRangeDirection,
    setBalanceRangeDirection,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    customers,
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
  } = useCustomersPage()

  const { createCustomer, updateCustomer, deleteCustomer, toggleCustomerActive } =
    useCustomerActions()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [toggleActiveOpen, setToggleActiveOpen] = useState(false)
  const [toggleActiveTarget, setToggleActiveTarget] = useState<Customer | null>(null)

  function openCreate() {
    setFormMode("create")
    setEditCustomer(null)
    setFormOpen(true)
  }

  function openEdit(customer: Customer) {
    setFormMode("edit")
    setEditCustomer(customer)
    setFormOpen(true)
  }

  function openDetails(customer: Customer) {
    router.push(`/dashboard/customers/${customer.id}`)
  }

  function openDelete(customer: Customer) {
    setDeleteTarget(customer)
    setDeleteOpen(true)
  }

  function openToggleActive(customer: Customer) {
    setToggleActiveTarget(customer)
    setToggleActiveOpen(true)
  }

  const customFrom = customPeriod?.from ?? defaultCustomPeriod().from
  const customTo = customPeriod?.to ?? defaultCustomPeriod().to

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            الزبائن
            /
            <p className="text-md text-muted-foreground">إدارة بيانات الزبائن</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <CustomersPeriodControls preset={periodPreset} onPresetChange={setPeriodPreset} />
          <Button onClick={openCreate} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            إضافة زبون
          </Button>
          <CustomerColumnCustomizer
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

      {config.showKPI ? <CustomersSummary dateRange={dateRange} /> : null}

      {config.showFilters ? (
        <CustomersFilters
          value={{
            search,
            isActive,
            customerType,
            balanceStatus,
            balanceMin,
            balanceMax,
            balanceRangeDirection,
          }}
          onChange={(next) => {
            setSearch(next.search)
            setIsActive(next.isActive)
            setCustomerType(next.customerType)
            setBalanceStatus(next.balanceStatus)
            setBalanceMin(next.balanceMin)
            setBalanceMax(next.balanceMax)
            setBalanceRangeDirection(next.balanceRangeDirection)
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
        <CustomersDataView
          viewMode={config.viewMode}
          customers={customers}
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
          onAddCustomer={openCreate}
          onViewDetails={openDetails}
          onEdit={openEdit}
          onDelete={openDelete}
          onToggleActive={openToggleActive}
        />
      </div>

      <DateRangeDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        from={customFrom}
        to={customTo}
        onApply={applyCustomPeriod}
      />

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditCustomer(null)
        }}
        mode={formMode}
        customer={editCustomer}
        onCreate={createCustomer}
        onUpdate={updateCustomer}
        onSaved={() => void mutate()}
      />

      <CustomerToggleActiveDialog
        open={toggleActiveOpen}
        onOpenChange={(open) => {
          setToggleActiveOpen(open)
          if (!open) setToggleActiveTarget(null)
        }}
        customer={toggleActiveTarget}
        onConfirm={async (customer) => {
          await toggleCustomerActive(customer)
          void mutate()
        }}
      />

      <CustomerDeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        customer={deleteTarget}
        onDelete={async (id) => {
          await deleteCustomer(id)
          void mutate()
        }}
      />
    </div>
  )
}
