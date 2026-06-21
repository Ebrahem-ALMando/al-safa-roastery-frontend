"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Eye, MoreHorizontal, FileText, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  patientName: string
  orderId: string
  date: string
  status: "pending" | "completed" | "approved"
  testsCount: number
}

const orders: Order[] = [
  {
    id: "1",
    patientName: "محمد أحمد علي",
    orderId: "ORD-2024-001",
    date: "2024-01-15",
    status: "completed",
    testsCount: 5,
  },
  {
    id: "2",
    patientName: "فاطمة حسن محمود",
    orderId: "ORD-2024-002",
    date: "2024-01-15",
    status: "pending",
    testsCount: 3,
  },
  {
    id: "3",
    patientName: "أحمد سعيد العمري",
    orderId: "ORD-2024-003",
    date: "2024-01-14",
    status: "approved",
    testsCount: 8,
  },
  {
    id: "4",
    patientName: "نورة خالد الفهد",
    orderId: "ORD-2024-004",
    date: "2024-01-14",
    status: "completed",
    testsCount: 2,
  },
  {
    id: "5",
    patientName: "عبدالله محمد الرشيد",
    orderId: "ORD-2024-005",
    date: "2024-01-13",
    status: "pending",
    testsCount: 6,
  },
]

const statusConfig = {
  pending: {
    label: "قيد الانتظار",
    className: "bg-warning/10 text-warning-foreground border-warning/20 dark:bg-warning/20",
  },
  completed: {
    label: "مكتمل",
    className: "bg-success/10 text-success border-success/20 dark:bg-success/20",
  },
  approved: {
    label: "معتمد",
    className: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
  },
}

export function RecentOrdersTable() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">آخر الطلبات</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right">اسم المريض</TableHead>
              <TableHead className="text-right">رقم الطلب</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">عدد الفحوصات</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right w-[70px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium">{order.patientName}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {order.orderId}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(order.date).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell>{order.testsCount} فحوصات</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn("font-medium", statusConfig[order.status].className)}
                  >
                    {statusConfig[order.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="rounded-lg">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">فتح القائمة</span>
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
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
