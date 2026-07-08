"use client"

import * as React from "react"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Product } from "@/features/products"

type ProductDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onDelete: (id: number) => Promise<void>
}

export function ProductDeleteDialog({ open, onOpenChange, product, onDelete }: ProductDeleteDialogProps) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleConfirm() {
    if (!product) return
    setDeleting(true)
    try {
      await onDelete(product.id)
      onOpenChange(false)
    } catch {
      /* toast handled by action hook */
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
      title="حذف المنتج؟"
      description={
        product ? (
          <span>
            سيتم حذف المنتج <span className="font-semibold text-foreground">«{product.name}»</span>.
            إذا كان مرتبطاً بعمليات سابقة فسيتم رفض الحذف ويمكنك إيقافه بدلاً من ذلك.
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
