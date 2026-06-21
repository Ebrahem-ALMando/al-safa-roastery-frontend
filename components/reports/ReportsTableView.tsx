"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Eye, Printer, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { LabOrder, LabOrdersListMeta } from "@/features/orders"
import { OrderPersonCell } from "@/components/orders/order-person-cell"
import { formatArDateTime, getOrderStatusClassName, getOrderStatusLabel } from "@/components/orders/orders-helpers"

type ReportsTableViewProps = {
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
}

function TableRowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 7 }).map((_, idx) => (
        <TableCell key={idx}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function ReportsTableView({
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
}: ReportsTableViewProps) {
  const headRow = (
    <TableRow>
      <TableHead className="w-9 text-center font-semibold">#</TableHead>
      <TableHead className="w-[120px] max-w-[120px] text-center font-semibold">رقم الطلب</TableHead>
      <TableHead className="w-[160px] pr-12 text-right font-semibold">معلومات المريض</TableHead>
      <TableHead className="w-[104px] text-center font-semibold">الحالة</TableHead>
      <TableHead className="w-[160px] pr-12 text-right font-semibold">معلومات الطبيب</TableHead>
      <TableHead className="w-[120px] text-center font-semibold">تاريخ الطلب</TableHead>
      <TableHead className="w-[132px] text-center font-semibold">إجراءات</TableHead>
    </TableRow>
  )

  return (
    <div className="p-0">
      {isLoading ? (
        <div className="w-full">
          <Table className="w-full table-fixed" dir="rtl">
            <TableHeader>{headRow}</TableHeader>
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
          <p className="text-lg font-semibold">لا توجد طلبات مكتملة للمعاينة حتى الآن</p>
          <p className="text-sm text-muted-foreground">ستظهر هنا تلقائيًا عند اكتمال إدخال النتائج.</p>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[960px] table-fixed" dir="rtl">
              <TableHeader>{headRow}</TableHeader>
              <TableBody>
                {orders.map((order, index) => {
                  const orderedAt = formatArDateTime(order.ordered_at)
                  const reqUser = order.requested_by_user
                  const patientName = order.patient?.full_name
                  const patientCode = order.patient?.patient_number?.trim() ? order.patient.patient_number : "—"

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
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <Badge variant="outline" className={getOrderStatusClassName(order.status)}>
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                          {order.items.some((x) => x.is_abnormal) ? (
                            <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              غير طبيعي
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 p-2">
                        <OrderPersonCell
                          name={doctorName ?? "—"}
                          secondary={doctorSecondary}
                          avatarUrl={reqUser?.avatar_url ?? null}
                        />
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <p className="text-xs">{orderedAt.date}</p>
                        <p className="text-[11px] text-muted-foreground">{orderedAt.time}</p>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon-sm" type="button" asChild aria-label="معاينة التقرير">
                            <Link href={`/dashboard/reports/${order.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon-sm" type="button" asChild aria-label="طباعة التقرير">
                            <Link href={`/dashboard/reports/${order.id}?print=1`}>
                              <Printer className="size-4" />
                            </Link>
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
