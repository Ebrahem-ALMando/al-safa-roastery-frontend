"use client"

import * as React from "react"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Item } from "@/features/items"

type ItemDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Item | null
  onDelete: (id: number) => Promise<void>
}

export function ItemDeleteDialog({ open, onOpenChange, item, onDelete }: ItemDeleteDialogProps) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleConfirm() {
    if (!item) return
    setDeleting(true)
    try {
      await onDelete(item.id)
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
      title="حذف الصنف؟"
      description={
        item ? (
          <span>
            سيتم حذف الصنف{" "}
            <span className="font-semibold text-foreground">«{item.name}»</span> نهائياً. لا يمكن
            التراجع عن هذا الإجراء.
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
