"use client"

import * as React from "react"
import { CheckCircle2, Power } from "lucide-react"
import { ConfirmDeactivateDialog } from "@/components/shared/confirm-deactivate-dialog"
import type { Supplier } from "@/features/suppliers"

const CONFIRM_BUTTON_CLASS =
  "min-w-28 rounded-xl text-white shadow-sm hover:opacity-90 bg-[#e4801a] hover:bg-[#e4801a]/90"

type SupplierToggleActiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onConfirm: (supplier: Supplier) => Promise<void>
}

export function SupplierToggleActiveDialog({
  open,
  onOpenChange,
  supplier,
  onConfirm,
}: SupplierToggleActiveDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isActive = supplier?.is_active ?? false

  React.useEffect(() => {
    if (!open) setLoading(false)
  }, [open])

  async function handleConfirm() {
    if (!supplier) return
    setLoading(true)
    try {
      await onConfirm(supplier)
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
      title={isActive ? "إيقاف المورد" : "تفعيل المورد"}
      description={
        isActive
          ? "سيبقى سجل المورد ومعاملاته محفوظة، لكن لن يظهر كخيار نشط في العمليات الجديدة."
          : "سيظهر المورد مجدداً كخيار نشط في العمليات والقوائم."
      }
      entityName={supplier?.name}
      confirmLabel={isActive ? "إيقاف" : "تفعيل"}
      icon={isActive ? Power : CheckCircle2}
      onConfirm={handleConfirm}
      isLoading={loading}
      confirmClassName={CONFIRM_BUTTON_CLASS}
    />
  )
}
