"use client"

import * as React from "react"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Supplier } from "@/features/suppliers"

type SupplierDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onDelete: (id: number) => Promise<void>
}

export function SupplierDeleteDialog({
  open,
  onOpenChange,
  supplier,
  onDelete,
}: SupplierDeleteDialogProps) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleConfirm() {
    if (!supplier) return
    setDeleting(true)
    try {
      await onDelete(supplier.id)
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
      title="حذف المورد؟"
      description={
        supplier ? (
          <span>
            سيتم حذف المورد{" "}
            <span className="font-semibold text-foreground">«{supplier.name}»</span> نهائياً. لا
            يمكن التراجع عن هذا الإجراء.
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
