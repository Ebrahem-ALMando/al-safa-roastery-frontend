"use client"

import * as React from "react"
import { CheckCircle2, Power } from "lucide-react"
import { ConfirmDeactivateDialog } from "@/components/shared/confirm-deactivate-dialog"
import type { Product } from "@/features/products"

const CONFIRM_BUTTON_CLASS =
  "min-w-28 rounded-xl text-white shadow-sm hover:opacity-90 bg-[#e4801a] hover:bg-[#e4801a]/90"

type ProductToggleActiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onConfirm: (product: Product) => Promise<void>
}

export function ProductToggleActiveDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: ProductToggleActiveDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isActive = product?.is_active ?? false

  async function handleConfirm() {
    if (!product) return
    setLoading(true)
    try {
      await onConfirm(product)
      onOpenChange(false)
    } catch {
      /* toast from useProductActions */
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDeactivateDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isActive ? "إيقاف المنتج" : "تفعيل المنتج"}
      description={
        isActive
          ? "سيتم إيقاف هذا المنتج ولن يظهر كمنتج نشط في العمليات الجديدة. هل تريد المتابعة؟"
          : "سيتم تفعيل هذا المنتج وإتاحته للاستخدام في العمليات الجديدة. هل تريد المتابعة؟"
      }
      entityName={product?.name}
      confirmLabel={isActive ? "إيقاف المنتج" : "تفعيل المنتج"}
      icon={isActive ? Power : CheckCircle2}
      onConfirm={handleConfirm}
      isLoading={loading}
      confirmClassName={CONFIRM_BUTTON_CLASS}
    />
  )
}
