"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PurchaseInvoice } from "@/features/purchases"

type PurchaseCancelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchase: PurchaseInvoice | null
  onCancel: (id: number, cancelReason: string) => Promise<void>
}

export function PurchaseCancelDialog({
  open,
  onOpenChange,
  purchase,
  onCancel,
}: PurchaseCancelDialogProps) {
  const [reason, setReason] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) setReason("")
  }, [open])

  const trimmed = reason.trim()
  const canSubmit = trimmed.length > 0 && !submitting

  async function handleConfirm() {
    if (!purchase || !canSubmit) return
    setSubmitting(true)
    try {
      await onCancel(purchase.id, trimmed)
      onOpenChange(false)
    } catch {
      /* toast from useAction */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) onOpenChange(next)
      }}
    >
      <AlertDialogContent dir="rtl" lang="ar" className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>إلغاء الفاتورة؟</AlertDialogTitle>
          <AlertDialogDescription>
            {purchase ? (
              <span>
                سيتم إلغاء الفاتورة{" "}
                <span className="font-semibold text-foreground" dir="ltr">
                  {purchase.invoice_number}
                </span>
                . يرجى توضيح سبب الإلغاء.
              </span>
            ) : (
              "يرجى توضيح سبب الإلغاء."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="cancel-reason">سبب الإلغاء</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب سبب الإلغاء..."
            rows={4}
            disabled={submitting}
            className="resize-none"
          />
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={submitting}>تراجع</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={() => void handleConfirm()}
            className="gap-2"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            تأكيد الإلغاء
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
