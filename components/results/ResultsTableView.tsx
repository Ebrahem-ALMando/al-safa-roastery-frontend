"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Edit2, Eye, FlaskConical, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { LabOrder, LabOrdersListMeta } from "@/features/orders"
import { OrderTestsResultsDialog } from "@/components/orders/order-tests-results-dialog"
import { cn } from "@/lib/utils"
import {
  countItemProgress,
  formatOrderedAt,
  getResultsProgressStatus,
  orderHasAbnormalFlag,
  resultsProgressLabels,
} from "./results-helpers"
import { OrderPersonCell } from "../orders/order-person-cell"

export interface ResultsTableViewProps {
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
  onViewOrderDetails: (orderId: number) => void
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

export function ResultsTableView({
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
  onViewOrderDetails,
}: ResultsTableViewProps) {
  const [testsDialogOrder, setTestsDialogOrder] = useState<LabOrder | null>(null)
  const [testsDialogOpen, setTestsDialogOpen] = useState(false)

  const headRow = (
    <TableRow>
      <TableHead className="w-9 text-center font-semibold">#</TableHead>
      <TableHead className="w-[88px] max-w-[88px] text-center font-semibold">رقم الطلب</TableHead>
      <TableHead className="w-[160px] text-right font-semibold">المريض</TableHead>
      <TableHead className="w-[120px] text-center font-semibold">تاريخ الطلب</TableHead>
      <TableHead className="w-[140px] text-center font-semibold">التقدم</TableHead>
      <TableHead className="w-[120px] text-center font-semibold">الحالة</TableHead>
      <TableHead className="w-[140px] text-center font-semibold">إجراءات</TableHead>
    </TableRow>
  )

  return (
    <div className="p-0">
      <OrderTestsResultsDialog
        open={testsDialogOpen}
        onOpenChange={(open) => {
          setTestsDialogOpen(open)
          if (!open) setTestsDialogOrder(null)
        }}
        order={testsDialogOrder}
      />

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
          <p className="font-medium">لم يتم العثور على طلبات مطابقة للفلتر</p>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-lg font-semibold">لا توجد طلبات تحاليل</p>
          <p className="max-w-md text-sm text-muted-foreground">أنشئ طلباً من صفحة طلبات التحاليل ثم ارجع لإدخال النتائج.</p>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[820px] table-fixed" dir="rtl">
              <TableHeader>{headRow}</TableHeader>
              <TableBody>
                {orders.map((order, index) => {
                  const { done, total } = countItemProgress(order)
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  const prog = getResultsProgressStatus(order)
                  const progCfg = resultsProgressLabels[prog]
                  const abnormal = orderHasAbnormalFlag(order)
                  const orderedAt = formatOrderedAt(order)
                  const patientName = order.patient?.full_name ?? "—"
                  const patientCode = order.patient?.patient_number ?? "—"
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="p-2 text-center text-xs text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="p-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block max-w-[88px] cursor-default truncate font-bold text-xs" dir="ltr">
                              {order.order_number}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="font-mono text-xs" dir="ltr">
                            {order.order_number}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="p-2">
                      <OrderPersonCell name={patientName} secondary={patientCode} />


                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <p className="text-xs">{orderedAt.date}</p>
                        <p className="text-[11px] text-muted-foreground">{orderedAt.time}</p>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                prog === "completed" ? "bg-emerald-500" : prog === "partial" ? "bg-amber-500" : "bg-muted-foreground/35"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {done}/{total}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          <Badge variant="outline" className={cn("gap-1 rounded-lg text-xs font-medium", progCfg.badgeClass)}>
                            {progCfg.label}
                          </Badge>
                          {abnormal ? (
                            <Badge variant="outline" className="rounded-lg border-destructive/30 bg-destructive/10 text-xs text-destructive">
                              غير طبيعي
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg bg-primary/10 text-primary"
                                aria-label="عرض التفاصيل"
                                onClick={() => onViewOrderDetails(order.id)}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              عرض التفاصيل
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 gap-1 rounded-lg px-2"
                                onClick={() => {
                                  setTestsDialogOrder(order)
                                  setTestsDialogOpen(true)
                                }}
                              >
                                <FlaskConical className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              عرض نتائج التحاليل
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" size="sm" className="h-8 rounded-lg px-2.5" asChild>
                                <Link href={`/dashboard/results/${order.id}`}>
                                  {prog === "completed" ?
                                    <Edit2 className="size-3.5" /> : <Plus className="size-3.5" />
                                  }
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {prog === "completed" ? "تحرير النتائج" : "إدخال النتائج"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                 
                    </motion.tr>
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
