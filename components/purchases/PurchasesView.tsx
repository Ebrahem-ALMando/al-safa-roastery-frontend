"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, RefreshCw, Settings2, Table } from "lucide-react"
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
import {
  defaultCustomPeriod,
  usePurchaseActions,
  usePurchaseSummary,
  usePurchasesPage,
  type PurchaseInvoice,
} from "@/features/purchases"
import { PurchasesDataView } from "./PurchasesDataView"
import { PurchasesFilters } from "./PurchasesFilters"
import { PurchasesPeriodControls } from "./PurchasesPeriodControls"
import { PurchasesSummary } from "./PurchasesSummary"
import { PurchaseColumnCustomizer } from "./PurchaseColumnCustomizer"
import { PurchaseDeleteDraftDialog } from "./PurchaseDeleteDraftDialog"
import { PurchaseCancelDialog } from "./PurchaseCancelDialog"

export function PurchasesView() {
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
    status,
    setStatus,
    supplierId,
    setSupplierId,
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    setPaymentMethod,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    columnFilters,
    purchases,
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
  } = usePurchasesPage()

  const { summary, isLoading: summaryLoading, error: summaryError } = usePurchaseSummary({
    dateRange,
    ...columnFilters,
  })
  const { deleteDraftPurchase, cancelPurchase } = usePurchaseActions()

  const [supplierName, setSupplierName] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PurchaseInvoice | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<PurchaseInvoice | null>(null)

  function openDetails(purchase: PurchaseInvoice) {
    router.push(`/dashboard/purchases/${purchase.id}`)
  }

  function openPrint(purchase: PurchaseInvoice) {
    if (purchase.status === "draft") return
    router.push(`/dashboard/purchases/${purchase.id}/print`)
  }

  function openDelete(purchase: PurchaseInvoice) {
    setDeleteTarget(purchase)
    setDeleteOpen(true)
  }

  function openCancel(purchase: PurchaseInvoice) {
    setCancelTarget(purchase)
    setCancelOpen(true)
  }

  const customFrom = customPeriod?.from ?? defaultCustomPeriod().from
  const customTo = customPeriod?.to ?? defaultCustomPeriod().to

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            المشتريات
            /
            <p className="text-md text-muted-foreground">إدارة فواتير المشتريات</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <PurchasesPeriodControls preset={periodPreset} onPresetChange={setPeriodPreset} />
          <PurchaseColumnCustomizer visibleColumns={visibleColumns} onChange={setColumnVisibility} />
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

      {config.showKPI ? (
        <PurchasesSummary summary={summary} isLoading={summaryLoading} error={summaryError} />
      ) : null}

      {config.showFilters ? (
        <PurchasesFilters
          value={{
            search,
            status,
            supplierId,
            supplierName,
            paymentStatus,
            paymentMethod,
          }}
          onChange={(next) => {
            setSearch(next.search)
            setStatus(next.status)
            setSupplierId(next.supplierId)
            setSupplierName(next.supplierName)
            setPaymentStatus(next.paymentStatus)
            setPaymentMethod(next.paymentMethod)
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
        <PurchasesDataView
          viewMode={config.viewMode}
          purchases={purchases}
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
          onViewDetails={openDetails}
          onPrint={openPrint}
          onCancel={openCancel}
          onDelete={openDelete}
        />
      </div>

      <DateRangeDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        from={customFrom}
        to={customTo}
        onApply={applyCustomPeriod}
      />

      <PurchaseDeleteDraftDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        purchase={deleteTarget}
        onDelete={async (id) => {
          await deleteDraftPurchase(id)
          void mutate()
        }}
      />

      <PurchaseCancelDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open)
          if (!open) setCancelTarget(null)
        }}
        purchase={cancelTarget}
        onCancel={async (id, reason) => {
          await cancelPurchase(id, { cancel_reason: reason })
          void mutate()
        }}
      />
    </div>
  )
}
