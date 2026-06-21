"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Stethoscope,
  TestTubes,
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface OrderCardData {
  id: string
  patientName: string
  orderId: string
  date: string
  time: string
  status: "pending" | "in-progress" | "completed" | "approved"
  testsCount: number
  totalPrice: number
  doctor: string
}

interface OrderCardProps {
  order: OrderCardData
  index?: number
}

const statusConfig = {
  pending: {
    label: "قيد الانتظار",
    className: "bg-warning/10 text-warning-foreground border-warning/20",
  },
  "in-progress": {
    label: "قيد التنفيذ",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  completed: {
    label: "مكتمل",
    className: "bg-success/10 text-success border-success/20",
  },
  approved: {
    label: "معتمد",
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
}

export function OrderCard({ order, index = 0 }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="group relative overflow-hidden border-border/50 transition-shadow duration-200 hover:border-primary/30 hover:shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground">{order.orderId}</p>
              <h3 className="font-semibold text-base line-clamp-1">{order.patientName}</h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Eye className="size-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <FileText className="size-4" />
                  طباعة التقرير
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <Trash2 className="size-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Badge
            variant="outline"
            className={cn("w-fit font-medium", statusConfig[order.status].className)}
          >
            {statusConfig[order.status].label}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 pb-5">
          {/* Date & Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(order.date).toLocaleDateString("ar-SA")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="font-mono text-muted-foreground">{order.time}</span>
            </div>
          </div>

          {/* Doctor */}
          <div className="flex items-center gap-2 text-sm">
            <Stethoscope className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{order.doctor}</span>
          </div>

          {/* Tests & Price */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <TestTubes className="size-4 text-primary" />
              <span className="font-medium">{order.testsCount} فحوصات</span>
            </div>
            <div className="text-lg font-bold text-primary">{order.totalPrice} ر.س</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
