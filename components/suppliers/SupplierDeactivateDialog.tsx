"use client"

import * as React from "react"
import { ConfirmDeactivateDialog } from "@/components/shared/confirm-deactivate-dialog"
import type { Supplier } from "@/features/suppliers"

type SupplierDeactivateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onDeactivate: (supplier: Supplier) => Promise<void>
}

export function SupplierDeactivateDialog({
  open,
  onOpenChange,
  supplier,
  onDeactivate,
}: SupplierDeactivateDialogProps) {
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!open) setLoading(false)
  }, [open])

  async function handleConfirm() {
    if (!supplier) return
    setLoading(true)
    try {
      await onDeactivate(supplier)
      onOpenChange(false)
    } catch {
      /* toast from useAction */
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDeactivateDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إلغاء تنشيط المورد"
      description="سيبقى سجل المورد ومعاملاته محفوظة، لكن لن يظهر كخيار نشط في العمليات الجديدة."
      entityName={supplier?.name}
      onConfirm={handleConfirm}
      isLoading={loading}
    />
  )
}
