"use client"

import * as React from "react"
import { CheckCircle2, Power } from "lucide-react"
import { ConfirmDeactivateDialog } from "@/components/shared/confirm-deactivate-dialog"
import type { Item } from "@/features/items"

const CONFIRM_BUTTON_CLASS =
  "min-w-28 rounded-xl text-white shadow-sm hover:opacity-90 bg-[#e4801a] hover:bg-[#e4801a]/90"

type ItemToggleActiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Item | null
  onConfirm: (item: Item) => Promise<void>
}

export function ItemToggleActiveDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: ItemToggleActiveDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isActive = item?.is_active ?? false

  React.useEffect(() => {
    if (!open) setLoading(false)
  }, [open])

  async function handleConfirm() {
    if (!item) return
    setLoading(true)
    try {
      await onConfirm(item)
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
      title={isActive ? "إيقاف الصنف" : "تفعيل الصنف"}
      description={
        isActive
          ? "سيبقى سجل الصنف وحركاته محفوظة، لكن لن يظهر كخيار نشط في العمليات الجديدة."
          : "سيظهر الصنف مجدداً كخيار نشط في العمليات والقوائم."
      }
      entityName={item?.name}
      confirmLabel={isActive ? "إيقاف" : "تفعيل"}
      icon={isActive ? Power : CheckCircle2}
      onConfirm={handleConfirm}
      isLoading={loading}
      confirmClassName={CONFIRM_BUTTON_CLASS}
    />
  )
}
