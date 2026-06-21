"use client"

import * as React from "react"
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
import { Loader2 } from "lucide-react"
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

  React.useEffect(() => {
    if (!open) setDeleting(false)
  }, [open])

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
    <AlertDialog open={open} onOpenChange={(next) => !deleting && onOpenChange(next)}>
      <AlertDialogContent className="rounded-2xl text-right" dir="rtl" lang="ar">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا المورد؟</AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            لا يمكن التراجع عن هذا الإجراء.
            {supplier ? (
              <span className="mt-2 block text-foreground/90">«{supplier.name}»</span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
          <AlertDialogCancel className="rounded-xl" disabled={deleting}>
            إلغاء
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            onClick={() => void handleConfirm()}
            disabled={!supplier || deleting}
          >
            {deleting ? <Loader2 className="me-1 size-4 animate-spin" /> : null}
            حذف
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
