"use client"

import { useRouter } from "next/navigation"
import { Eye, Printer, Receipt, Trash2, Truck } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  formatArDate,
  formatLinesCountAr,
  formatUsd,
  purchaseSupplierName,
  type PurchaseInvoice,
} from "@/features/purchases"
import { PurchasePaymentStatusBadge } from "./PurchasePaymentStatusBadge"
import { PurchaseStatusBadge } from "./PurchaseStatusBadge"

function purchaseDetailsHref(id: number) {
  return `/dashboard/purchases/${id}`
}

type PurchaseCardProps = {
  purchase: PurchaseInvoice
  onViewDetails?: (purchase: PurchaseInvoice) => void
  onPrint?: (purchase: PurchaseInvoice) => void
  onCancel?: (purchase: PurchaseInvoice) => void
  onDelete?: (purchase: PurchaseInvoice) => void
}

export function PurchaseCard({
  purchase,
  onViewDetails,
  onPrint,
  onCancel,
  onDelete,
}: PurchaseCardProps) {
  const router = useRouter()
  const isDraft = purchase.status === "draft"
  const isCompleted = purchase.status === "completed"
  const canPrint = purchase.status === "completed" || purchase.status === "cancelled"

  const goToDetails = () => {
    if (onViewDetails) {
      onViewDetails(purchase)
      return
    }
    router.push(purchaseDetailsHref(purchase.id))
  }

  return (
    <TooltipProvider>
      <Card
        role="button"
        tabIndex={0}
        dir="rtl"
        className="group relative flex min-w-0 flex-col justify-between overflow-hidden border-2 border-primary/20 bg-linear-to-br from-white via-primary/5 to-primary/10 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:from-card dark:via-primary/15 dark:to-primary/20"
        onClick={goToDetails}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            goToDetails()
          }
        }}
      >
        <CardHeader className="relative z-10 pb-3">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary" dir="ltr">
                {purchase.invoice_number}
              </p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Truck className="size-3.5 shrink-0" />
                {purchaseSupplierName(purchase)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <PurchaseStatusBadge status={purchase.status} />
                <PurchasePaymentStatusBadge status={purchase.payment_status} />
              </div>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="size-6" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-3">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">تاريخ الفاتورة</span>
              <span>{formatArDate(purchase.invoice_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الإجمالي</span>
              <span className="font-semibold" dir="ltr">
                {formatUsd(purchase.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">البنود</span>
              <Badge variant="outline">{formatLinesCountAr(purchase.lines_count)}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 border-t border-border/60 pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sky-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToDetails()
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>التفاصيل</TooltipContent>
            </Tooltip>

            {canPrint && onPrint ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-violet-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPrint(purchase)
                    }}
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>طباعة</TooltipContent>
              </Tooltip>
            ) : null}

            {isDraft && onDelete ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(purchase)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>حذف المسودة</TooltipContent>
              </Tooltip>
            ) : null}

            {isCompleted && onCancel ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-orange-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancel(purchase)
                    }}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>إلغاء</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
