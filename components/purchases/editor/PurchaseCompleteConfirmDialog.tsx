"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatUsd } from "@/features/purchases"

type PurchaseCompleteConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  supplierName: string
  total: number
  paidAmount: number
  remaining: number
  isSubmitting?: boolean
}

export function PurchaseCompleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  supplierName,
  total,
  paidAmount,
  remaining,
  isSubmitting = false,
}: PurchaseCompleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl" lang="ar" className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد اعتماد الفاتورة</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                اعتماد الفاتورة سيحدث المخزون ورصيد المورد وأي حركة مالية مرتبطة بها. لا يمكن
                التراجع إلا عبر إلغاء الفاتورة لاحقاً.
              </p>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-foreground">
                <p>
                  <span className="text-muted-foreground">المورد: </span>
                  <span className="font-semibold">{supplierName}</span>
                </p>
                <p className="mt-1" dir="ltr">
                  الإجمالي: {formatUsd(total)} · المدفوع: {formatUsd(paidAmount)} · المتبقي:{" "}
                  {formatUsd(remaining)}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-start">
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "جارٍ الاعتماد…" : "اعتماد الفاتورة"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isSubmitting}>رجوع</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
