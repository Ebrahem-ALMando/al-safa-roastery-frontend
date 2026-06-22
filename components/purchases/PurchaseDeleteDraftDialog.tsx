"use client"

import * as React from "react"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { PurchaseInvoice } from "@/features/purchases"

type PurchaseDeleteDraftDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchase: PurchaseInvoice | null
  onDelete: (id: number) => Promise<void>
}

export function PurchaseDeleteDraftDialog({
  open,
  onOpenChange,
  purchase,
  onDelete,
}: PurchaseDeleteDraftDialogProps) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleConfirm() {
    if (!purchase) return
    setDeleting(true)
    try {
      await onDelete(purchase.id)
      onOpenChange(false)
    } catch {
      /* toast from useAction */
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) onOpenChange(next)
      }}
      title="حذف مسودة الفاتورة؟"
      description={
        purchase ? (
          <span>
            سيتم حذف مسودة الفاتورة{" "}
            <span className="font-semibold text-foreground" dir="ltr">
              «{purchase.invoice_number}»
            </span>{" "}
            نهائياً. لا يمكن التراجع عن هذا الإجراء.
          </span>
        ) : (
          "لا يمكن التراجع عن هذا الإجراء."
        )
      }
      onConfirm={() => void handleConfirm()}
      isLoading={deleting}
      loadingLabel="جار الحذف"
    />
  )
}
