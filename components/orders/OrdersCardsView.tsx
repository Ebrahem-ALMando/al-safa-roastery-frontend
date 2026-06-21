"use client"

import { Calendar, ClipboardList, Stethoscope, UserRound } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { LabOrder } from "@/features/orders"
import { formatArDateTime, getOrderStatusClassName, getOrderStatusLabel } from "./orders-helpers"
import { OrderPersonCell } from "./order-person-cell"

interface OrdersCardsViewProps {
  orders: LabOrder[]
  isLoading?: boolean
}

export function OrdersCardsView({ orders, isLoading = false }: OrdersCardsViewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="space-y-3 p-4"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order, index) => {
        const orderedAt = formatArDateTime(order.ordered_at)
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
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -4, transition: { duration: 0.16 } }}
          >
            <Card className="overflow-hidden border-border/50 transition-all hover:border-primary/40 hover:shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{order.order_number}</p>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold">{order.patient?.full_name ?? "—"}</p>
                  </div>
                  <Badge variant="outline" className={getOrderStatusClassName(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><UserRound className="size-4" /> patient_id: {order.patient_id}</div>
                <div className="flex min-w-0 items-start gap-2 text-muted-foreground">
                  <Stethoscope className="mt-1 size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <OrderPersonCell
                      name={doctorName ?? "—"}
                      secondary={doctorSecondary}
                      avatarUrl={reqUser?.avatar_url ?? null}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-4" /> {orderedAt.date} - {orderedAt.time}</div>
                <div className="flex items-center gap-2 border-t pt-2 text-muted-foreground">
                  <ClipboardList className="size-4 text-primary" />
                  <span>{order.items.length} تحليل</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
