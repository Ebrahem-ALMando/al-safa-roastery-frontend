"use client"

import * as React from "react"
import { CheckCircle2, Power } from "lucide-react"
import { ConfirmDeactivateDialog } from "@/components/shared/confirm-deactivate-dialog"
import type { Customer } from "@/features/customers"

const CONFIRM_BUTTON_CLASS =
  "min-w-28 rounded-xl text-white shadow-sm hover:opacity-90 bg-[#e4801a] hover:bg-[#e4801a]/90"

type CustomerToggleActiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onConfirm: (customer: Customer) => Promise<void>
}

export function CustomerToggleActiveDialog({
  open,
  onOpenChange,
  customer,
  onConfirm,
}: CustomerToggleActiveDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isActive = customer?.is_active ?? false

  React.useEffect(() => {
    if (!open) setLoading(false)
  }, [open])

  async function handleConfirm() {
    if (!customer) return
    setLoading(true)
    try {
      await onConfirm(customer)
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
      title={isActive ? "إيقاف الزبون" : "تفعيل الزبون"}
      description={
        isActive
          ? "سيبقى سجل الزبون ومعاملاته محفوظة، لكن لن يظهر كخيار نشط في العمليات الجديدة."
          : "سيظهر الزبون مجدداً كخيار نشط في العمليات والقوائم."
      }
      entityName={customer?.name}
      confirmLabel={isActive ? "إيقاف" : "تفعيل"}
      icon={isActive ? Power : CheckCircle2}
      onConfirm={handleConfirm}
      isLoading={loading}
      confirmClassName={CONFIRM_BUTTON_CLASS}
    />
  )
}
