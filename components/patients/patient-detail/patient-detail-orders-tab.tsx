"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  FileText,
  FlaskConical,
  Plus,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"
import { OrderTestsResultsDialog } from "@/components/orders/order-tests-results-dialog"
import { SectionTitle } from "@/components/orders/order-detail-primitives"
import {
  formatArDateTime,
  getOrderStatusClassName,
  getOrderStatusLabel,
} from "@/components/orders/orders-helpers"
import { countItemProgress, getResultsProgressStatus, resultsProgressLabels } from "@/components/results/results-helpers"
import type { LabOrder } from "@/features/orders"
import { cn } from "@/lib/utils"

type PatientDetailOrdersTabProps = {
  patientId: number
  orders: LabOrder[]
  isLoading: boolean
  error: Error | undefined
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
}

export function PatientDetailOrdersTab({
  patientId,
  orders,
  isLoading,
  error,
  currentPage,
  lastPage,
  canPrev,
  canNext,
  onPageChange,
}: PatientDetailOrdersTabProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsOrderId, setDetailsOrderId] = React.useState<number | null>(null)
  const [testsDialogOrder, setTestsDialogOrder] = React.useState<LabOrder | null>(null)
  const [testsDialogOpen, setTestsDialogOpen] = React.useState(false)

  const openDetails = (orderId: number) => {
    setDetailsOrderId(orderId)
    setDetailsOpen(true)
  }

  const onDetailsOpenChange = (open: boolean) => {
    setDetailsOpen(open)
    if (!open) setDetailsOrderId(null)
  }

  const openTestsDialog = (order: LabOrder) => {
    setTestsDialogOrder(order)
    setTestsDialogOpen(true)
  }

  return (
    <>
      <OrderDetailsDialog open={detailsOpen} onOpenChange={onDetailsOpenChange} orderId={detailsOrderId} />
      <OrderTestsResultsDialog
        open={testsDialogOpen}
        onOpenChange={(open) => {
          setTestsDialogOpen(open)
          if (!open) setTestsDialogOrder(null)
        }}
        order={testsDialogOrder}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon={ClipboardList} title="طلبات التحاليل" hint="مرتبطة بهذا المريض من الخادم" />
        <Button asChild size="sm" className="gap-2 rounded-xl">
          <Link href={`/dashboard/orders/new?patient=${patientId}`}>
            <Plus className="size-4" />
            طلب جديد
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error.message}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <Activity className="size-8 text-muted-foreground" />
          <p className="font-semibold">لا توجد طلبات</p>
          <Button asChild variant="outline" className="gap-2 rounded-xl">
            <Link href={`/dashboard/orders/new?patient=${patientId}`}>
              <Plus className="size-4" />
              إضافة أول طلب
            </Link>
          </Button>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="space-y-3">
            {orders.map((order, index) => {
              const dt = order.ordered_at ? formatArDateTime(order.ordered_at) : { date: "—", time: "" }
              const { done, total } = countItemProgress(order)
              const prog = getResultsProgressStatus(order)
              const progCfg = resultsProgressLabels[prog]
              const itemsCount = order.items?.length ?? 0

              return (
                <div
                  key={order.id}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:border-primary/25"
                >
                  <span className="pointer-events-none absolute inset-y-0 right-0 w-1 rounded-l-full bg-primary/30" />
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-bold text-primary" dir="ltr">
                          {order.order_number}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn("gap-1 rounded-full px-2.5 py-0.5", getOrderStatusClassName(order.status))}
                        >
                          <Activity className="size-3" />
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                        <Badge variant="outline" className={cn("rounded-lg text-[11px]", progCfg.badgeClass)}>
                          {progCfg.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{dt.date}</span>
                        {dt.time ? (
                          <>
                            <span aria-hidden>·</span>
                            <span dir="ltr">{dt.time}</span>
                          </>
                        ) : null}
                        <span aria-hidden>·</span>
                        <span>
                          {done}/{total} نتيجة
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-lg text-xs tabular-nums">
                        {itemsCount} تحليل
                      </Badge>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg bg-primary/10 text-primary hover:bg-primary/15"
                            aria-label="عرض التفاصيل"
                            onClick={() => openDetails(order.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>عرض التفاصيل</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg"
                            onClick={() => openTestsDialog(order)}
                          >
                            <FlaskConical className="size-3.5" />
                            عرض النتائج
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>عرض نتائج التحاليل</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" size="sm" className="h-8 gap-1.5 rounded-lg" asChild>
                            <Link href={`/dashboard/results/${order.id}`}>
                              {prog === "completed" ? (
                                <Edit2 className="size-3.5" />
                              ) : (
                                <Plus className="size-3.5" />
                              )}
                              {prog === "completed" ? "تحرير النتائج" : "إدخال النتائج"}
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {prog === "completed" ? "تحرير النتائج" : "إدخال النتائج"}
                        </TooltipContent>
                      </Tooltip>

                      {order.status === "completed" || order.status === "approved" ? (
                        <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 rounded-lg">
                          <Link href={`/dashboard/reports/${order.id}`}>
                            <FileText className="size-3.5" />
                            التقرير
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {lastPage > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 rounded-xl"
                disabled={!canPrev}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              >
                <ChevronRight className="size-4" />
                السابق
              </Button>
              <span className="text-sm text-muted-foreground" dir="ltr">
                {currentPage} / {lastPage}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 rounded-xl"
                disabled={!canNext}
                onClick={() => onPageChange(currentPage + 1)}
              >
                التالي
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          ) : null}
        </TooltipProvider>
      )}
    </>
  )
}
