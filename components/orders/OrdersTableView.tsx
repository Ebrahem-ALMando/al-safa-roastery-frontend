"use client"

import { useState } from "react"
import { BadgeCheck, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { LabOrder, LabOrdersListMeta } from "@/features/orders"
import { formatArDateTime, getOrderStatusClassName, getOrderStatusLabel } from "./orders-helpers"
import { OrderPersonCell } from "./order-person-cell"
import { OrderTestsResultsDialog } from "./order-tests-results-dialog"

interface OrdersTableViewProps {
  orders: LabOrder[]
  meta?: LabOrdersListMeta
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddOrder: () => void
  onViewOrderDetails: (orderId: number) => void
  onEditOrder: (orderId: number) => void
  onDeleteOrder: (order: LabOrder) => void
  onChangeOrderStatus: (order: LabOrder) => void
}

function TableRowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 9 }).map((_, idx) => (
        <TableCell key={idx}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function OrdersTableView({
  orders,
  meta,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  lastPage,
  canPrev,
  canNext,
  onPageChange,
  onAddOrder,
  onViewOrderDetails,
  onEditOrder,
  onDeleteOrder,
  onChangeOrderStatus,
}: OrdersTableViewProps) {
  const [testsDialogOrder, setTestsDialogOrder] = useState<LabOrder | null>(null)
  const [testsDialogOpen, setTestsDialogOpen] = useState(false)

  const openTestsDialog = (order: LabOrder) => {
    setTestsDialogOrder(order)
    setTestsDialogOpen(true)
  }

  const onTestsDialogOpenChange = (open: boolean) => {
    setTestsDialogOpen(open)
    if (!open) setTestsDialogOrder(null)
  }

  const headRow = (
    <TableRow>
      <TableHead className="w-9 text-center font-semibold">#</TableHead>
      <TableHead className="w-[120px] max-w-[120px] text-center font-semibold">رقم الطلب</TableHead>
      <TableHead className="w-[160px] pr-12 text-right font-semibold">معلومات المريض</TableHead>
      <TableHead className="w-[104px] text-center font-semibold">الحالة</TableHead>
      <TableHead className="w-[160px] pr-12 text-right font-semibold">معلومات الطبيب</TableHead>
      <TableHead className="w-[100px] max-w-[100px] text-right font-semibold">ملاحظات</TableHead>
      <TableHead className="w-[120px] text-center font-semibold">تاريخ الطلب</TableHead>
      <TableHead className="w-[60px] text-center font-semibold">التحاليل</TableHead>
      <TableHead className="w-[132px] text-center font-semibold">إجراءات</TableHead>
    </TableRow>
  )

  return (
    <div className="p-0">
      <OrderTestsResultsDialog open={testsDialogOpen} onOpenChange={onTestsDialogOpenChange} order={testsDialogOrder} />

      {isLoading ? (
        <div className="w-full">
          <Table className="w-full table-fixed" dir="rtl">
            <TableHeader>
              {headRow}
            </TableHeader>
            <TableBody>{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}</TableBody>
          </Table>
        </div>
      ) : isFilteredNoHits ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/30 text-muted-foreground">
            <Search className="size-6 opacity-60" />
          </div>
          <p className="font-medium">لم يتم العثور على نتائج</p>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <p className="text-lg font-semibold">لا توجد طلبات تحاليل بعد</p>
          <Button type="button" onClick={onAddOrder} className="gap-2 rounded-xl">
            <Plus className="size-4" />
            إضافة طلب
          </Button>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[960px] table-fixed" dir="rtl">
              <TableHeader>{headRow}</TableHeader>
              <TableBody>
                {orders.map((order, index) => {
                  const orderedAt = formatArDateTime(order.ordered_at)
                  const notesText = order.notes?.trim() ? order.notes : "—"
                  const patientName = order.patient?.full_name
                  const patientCode = order.patient?.patient_number?.trim()
                    ? order.patient.patient_number
                    : "—"
                  const reqUser = order.requested_by_user
                  const doctorName =
                    reqUser?.name?.trim() ||
                    (order.requesting_doctor_name?.trim() ? order.requesting_doctor_name : null)
                  const doctorSecondary = reqUser?.username?.trim()
                    ? `@${reqUser.username}`
                    : order.requested_by != null
                      ? `#${order.requested_by}`
                      : doctorName
                        ? "طبيب معالج"
                        : "—"

                  return (
                    <TableRow key={order.id} className="transition-all duration-200 hover:bg-muted/40">
                      <TableCell className="p-2 text-center text-xs text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="w-[120px] max-w-[120px] p-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block max-w-[120px] cursor-default truncate font-bold text-xs" dir="ltr">
                              {order.order_number}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-md font-mono text-xs" dir="ltr">
                            {order.order_number}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="min-w-0 p-2">
                        <OrderPersonCell name={patientName} secondary={patientCode} />
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <Badge variant="outline" className={getOrderStatusClassName(order.status)}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-0 p-2">
                        <OrderPersonCell
                          name={doctorName ?? "—"}
                          secondary={doctorSecondary}
                          avatarUrl={reqUser?.avatar_url ?? null}
                        />
                      </TableCell>
                      <TableCell className="w-[100px] max-w-[100px] p-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block max-w-[100px] cursor-default truncate text-sm text-foreground">
                              {notesText}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm text-right text-sm" dir="rtl">
                            {notesText}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <p className="text-xs">{orderedAt.date}</p>
                        <p className="text-[11px] text-muted-foreground">{orderedAt.time}</p>
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 min-w-9 rounded-lg px-2.5 tabular-nums shadow-sm"
                          onClick={() => openTestsDialog(order)}
                          aria-label={`عرض تحاليل الطلب، العدد ${order.items.length}`}
                        >
                          {order.items.length}
                        </Button>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            aria-label="عرض التفاصيل"
                            onClick={() => onViewOrderDetails(order.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            aria-label="تغيير حالة الطلب"
                            onClick={() => onChangeOrderStatus(order)}
                          >
                            <BadgeCheck className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            aria-label="تعديل الطلب"
                            onClick={() => onEditOrder(order.id)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            className="text-destructive hover:text-destructive"
                            aria-label="حذف الطلب"
                            onClick={() => onDeleteOrder(order)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      )}

      {!isLoading && orders.length > 0 && meta != null && lastPage > 1 ? (
        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <p className="text-center text-sm text-muted-foreground sm:text-start" dir="ltr">
            {meta.total} — صفحة {currentPage} من {lastPage}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!canPrev}
            >
              <ChevronRight className="size-4" />
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canNext}
            >
              التالي
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
