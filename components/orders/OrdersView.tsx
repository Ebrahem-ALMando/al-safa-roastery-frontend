"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, FileSpreadsheet, FileText, Plus, Settings2 } from "lucide-react"
import { DashboardPageHeader, OperationalDateScopeControls } from "@/components/dashboard"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { OrdersDataView } from "@/components/orders/OrdersDataView"
import { OrdersFilters } from "@/components/orders/OrdersFilters"
import { OrdersSummary } from "@/components/orders/OrdersSummary"
import { LabOrderChangeStatusDialog } from "@/components/orders/lab-order-change-status-dialog"
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"
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
import { useOrdersPage, type LabOrder } from "@/features/orders"
import { useAction } from "@/lib/hooks/useAction"
import type { LaravelSuccessResponse } from "@/lib/api"

export function OrdersView() {
  const router = useRouter()
  const { execute } = useAction()
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsOrderId, setDetailsOrderId] = React.useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<LabOrder | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [statusDialogOrder, setStatusDialogOrder] = React.useState<LabOrder | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)

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
    mutate,
  } = useOrdersPage()

  const openDetails = React.useCallback((orderId: number) => {
    setDetailsOrderId(orderId)
    setDetailsOpen(true)
  }, [])

  const onDetailsOpenChange = React.useCallback((open: boolean) => {
    setDetailsOpen(open)
    if (!open) setDetailsOrderId(null)
  }, [])

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await execute<LaravelSuccessResponse<unknown>>({
        endpoint: `lab-orders/${deleteTarget.id}`,
        method: "DELETE",
      })
      setDeleteTarget(null)
      await mutate()
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, execute, mutate])

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <OrderDetailsDialog open={detailsOpen} onOpenChange={onDetailsOpenChange} orderId={detailsOrderId} />
      <LabOrderChangeStatusDialog
        open={statusDialogOpen}
        onOpenChange={(o) => {
          setStatusDialogOpen(o)
          if (!o) setStatusDialogOrder(null)
        }}
        order={statusDialogOrder}
        onSuccess={() => {
          void mutate()
        }}
      />
      <ConfirmDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o && !isDeleting) setDeleteTarget(null)
        }}
        title="حذف طلب التحاليل؟"
        description={
          deleteTarget ? (
            <span>
              سيتم حذف الطلب رقم{" "}
              <span className="font-mono font-semibold text-foreground" dir="ltr">
                {deleteTarget.order_number}
              </span>{" "}
              نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </span>
          ) : null
        }
        onConfirm={() => void handleConfirmDelete()}
        isLoading={isDeleting}
      />
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            طلبات التحاليل
            /
            <p className="text-md text-muted-foreground">إدارة ومتابعة طلبات المختبر</p>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <OperationalDateScopeControls preset={dateScopePreset} onPresetChange={setDateScopePreset} />
          <Link href="/dashboard/orders/new">
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              طلب جديد
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
              <DropdownMenuCheckboxItem checked={config.showKPI} onCheckedChange={(checked) => toggleShowKPI(Boolean(checked))}>
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={config.showFilters} onCheckedChange={(checked) => toggleShowFilters(Boolean(checked))}>
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
              <DropdownMenuItem className="gap-2"><FileSpreadsheet className="h-4 w-4" />Excel</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><FileText className="h-4 w-4" />PDF</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><FileText className="h-4 w-4" />CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewToggle value={config.viewMode} onChange={setViewMode} />
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? <OrdersSummary orders={orders} meta={meta} isLoading={isLoading} /> : null}

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
        <p className="text-center text-sm text-muted-foreground" role="status">
          تعذر تحميل بيانات الطلبات. حاول مرة أخرى.
        </p>
      ) : null}

      <div className={config.viewMode === "cards" ? "overflow-hidden" : "overflow-hidden rounded-xl border border-border/60 shadow-sm"}>
        <OrdersDataView
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
          onAddOrder={() => router.push("/dashboard/orders/new")}
          onViewOrderDetails={openDetails}
          onEditOrder={(id) => router.push(`/dashboard/orders/new?edit=${id}`)}
          onDeleteOrder={setDeleteTarget}
          onChangeOrderStatus={(order) => {
            setStatusDialogOrder(order)
            setStatusDialogOpen(true)
          }}
        />
      </div>
    </div>
  )
}
