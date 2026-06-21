"use client"

import * as React from "react"
import Link from "next/link"
import { Download, FileSpreadsheet, FileText, Settings2 } from "lucide-react"
import { DashboardPageHeader, OperationalDateScopeControls } from "@/components/dashboard"
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"
import { OrdersFilters } from "@/components/orders/OrdersFilters"
import { ResultsSummary } from "./ResultsSummary"
import { ViewToggle } from "@/components/view-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useResultsPage } from "@/features/results"
import { ResultsDataView } from "./ResultsDataView"

export function ResultsView() {
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsOrderId, setDetailsOrderId] = React.useState<number | null>(null)

  const {
    dateScopePreset,
    setDateScopePreset,
    search,
    setSearch,
    status,
    setStatus,
    patientId,
    setPatientId,
    orderedFrom,
    setOrderedFrom,
    orderedTo,
    setOrderedTo,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    orders,
    meta,
    isLoading,
    error,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  } = useResultsPage()

  const openDetails = React.useCallback((orderId: number) => {
    setDetailsOrderId(orderId)
    setDetailsOpen(true)
  }, [])

  const onDetailsOpenChange = React.useCallback((open: boolean) => {
    setDetailsOpen(open)
    if (!open) setDetailsOrderId(null)
  }, [])

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <OrderDetailsDialog open={detailsOpen} onOpenChange={onDetailsOpenChange} orderId={detailsOrderId} />

      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            إدخال النتائج
            /
            <p className="text-md text-muted-foreground">متابعة الطلبات وإدخال القيم</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <OperationalDateScopeControls preset={dateScopePreset} onPresetChange={setDateScopePreset} />
          <Link href="/dashboard/orders">
            <Button variant="outline" className="rounded-xl">
              طلبات التحاليل
            </Button>
          </Link>

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
              <DropdownMenuCheckboxItem checked={config.showKPI} onCheckedChange={(c) => toggleShowKPI(Boolean(c))}>
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={config.showFilters} onCheckedChange={(c) => toggleShowFilters(Boolean(c))}>
                إظهار الفلاتر
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewToggle value={config.viewMode} onChange={setViewMode} />
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? <ResultsSummary orders={orders} meta={meta} isLoading={isLoading} /> : null}

      {config.showFilters ? (
        <OrdersFilters
          value={{ search, status, patientId, orderedFrom, orderedTo }}
          onChange={(next) => {
            setSearch(next.search)
            setStatus(next.status)
            setPatientId(next.patientId)
            setOrderedFrom(next.orderedFrom)
            setOrderedTo(next.orderedTo)
          }}
          isLoading={isLoading}
        />
      ) : null}

      {error && !isLoading ? (
        <p className="text-center text-sm text-destructive" role="status">
          تعذر تحميل الطلبات. تحقق من الاتصال وحاول مرة أخرى.
        </p>
      ) : null}

      <div
        className={
          config.viewMode === "cards" ? "overflow-hidden" : "overflow-hidden rounded-xl border border-border/60 shadow-sm"
        }
      >
        <ResultsDataView
          viewMode={config.viewMode}
          orders={orders}
          meta={meta}
          isLoading={isLoading}
          isFilteredNoHits={isFilteredNoHits}
          isTrueEmpty={isTrueEmpty}
          currentPage={currentPage}
          lastPage={lastPage}
          canPrev={canPrev}
          canNext={canNext}
          onPageChange={setPage}
          onViewOrderDetails={openDetails}
        />
      </div>
    </div>
  )
}
