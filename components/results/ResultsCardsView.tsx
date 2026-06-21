"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ClipboardList, Eye, FileText, FlaskConical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { LabOrder } from "@/features/orders"
import { cn } from "@/lib/utils"
import {
  countItemProgress,
  formatOrderedAt,
  getResultsProgressStatus,
  orderHasAbnormalFlag,
  resultsProgressLabels,
} from "./results-helpers"

interface ResultsCardsViewProps {
  orders: LabOrder[]
  isLoading?: boolean
  onViewOrderDetails: (orderId: number) => void
}

export function ResultsCardsView({ orders, isLoading = false, onViewOrderDetails }: ResultsCardsViewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order, index) => {
        const orderedAt = formatOrderedAt(order)
        const { done, total } = countItemProgress(order)
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        const prog = getResultsProgressStatus(order)
        const progCfg = resultsProgressLabels[prog]
        const abnormal = orderHasAbnormalFlag(order)

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -4, transition: { duration: 0.16 } }}
          >
            <Card className="overflow-hidden border-border/50 transition-all hover:border-primary/35 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                      {order.order_number}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold">{order.patient?.full_name ?? "—"}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline" className={cn("rounded-lg text-[10px]", progCfg.badgeClass)}>
                      {progCfg.label}
                    </Badge>
                    {abnormal ? (
                      <Badge variant="outline" className="rounded-lg border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
                        غير طبيعي
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4 shrink-0" />
                  <span>
                    {orderedAt.date} · {orderedAt.time}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="size-3.5" />
                      بنود الفحص
                    </span>
                    <span className="tabular-nums">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        prog === "completed" ? "bg-emerald-500" : prog === "partial" ? "bg-amber-500" : "bg-muted-foreground/35"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button type="button" variant="outline" size="sm" className="gap-1 rounded-lg" onClick={() => onViewOrderDetails(order.id)}>
                    <Eye className="size-3.5" />
                    تفاصيل
                  </Button>
                  <Button type="button" size="sm" className="gap-1 rounded-lg" asChild>
                    <Link href={`/dashboard/results/${order.id}`}>
                      <FlaskConical className="size-3.5" />
                      {prog === "completed" ? "تعديل النتائج" : "إدخال النتائج"}
                    </Link>
                  </Button>
                  {prog === "completed" ? (
                    <Button type="button" variant="secondary" size="sm" className="gap-1 rounded-lg" asChild>
                      <Link href={`/dashboard/reports/${order.id}`}>
                        <FileText className="size-3.5" />
                        تقرير
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
