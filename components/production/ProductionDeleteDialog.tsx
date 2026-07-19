"use client"

import { useState } from "react"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { productionBatchNumber, type ProductionBatch } from "@/src/features/production"

export function ProductionDeleteDialog({ open, onOpenChange, batch, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; batch: ProductionBatch | null; onConfirm: (id: number) => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  return <ConfirmDeleteDialog open={open} onOpenChange={(next) => { if (!loading) onOpenChange(next) }} title="حذف مسودة الإنتاج؟" description={batch ? <>سيتم حذف المسودة <span className="font-mono font-semibold" dir="ltr">{productionBatchNumber(batch)}</span> نهائياً.</> : "لا يمكن التراجع عن هذا الإجراء."} onConfirm={() => { if (!batch) return; setLoading(true); void onConfirm(batch.id).then(() => onOpenChange(false)).finally(() => setLoading(false)) }} isLoading={loading} loadingLabel="جار الحذف" />
}
