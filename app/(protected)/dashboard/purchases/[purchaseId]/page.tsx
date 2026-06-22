"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  usePurchaseActions,
  usePurchaseDetails,
  type PurchaseInvoice,
} from "@/features/purchases"
import { PurchaseDetailsView } from "@/components/purchases/PurchaseDetailsView"
import { PurchaseDeleteDraftDialog } from "@/components/purchases/PurchaseDeleteDraftDialog"
import { PurchaseCancelDialog } from "@/components/purchases/PurchaseCancelDialog"

export default function PurchaseDetailPage() {
  const params = useParams<{ purchaseId: string }>()
  const router = useRouter()
  const raw = params?.purchaseId
  const idNum = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN
  const purchaseId = Number.isFinite(idNum) && idNum > 0 ? idNum : null

  const { mutate } = usePurchaseDetails(purchaseId)
  const { deleteDraftPurchase, cancelPurchase } = usePurchaseActions()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PurchaseInvoice | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<PurchaseInvoice | null>(null)

  if (purchaseId === null) {
    return (
      <div
        className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive"
        dir="rtl"
        lang="ar"
      >
        معرّف الفاتورة غير صالح.
      </div>
    )
  }

  return (
    <>
      <PurchaseDetailsView
        purchaseId={purchaseId}
        onDelete={(purchase) => {
          setDeleteTarget(purchase)
          setDeleteOpen(true)
        }}
        onCancel={(purchase) => {
          setCancelTarget(purchase)
          setCancelOpen(true)
        }}
      />

      <PurchaseDeleteDraftDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        purchase={deleteTarget}
        onDelete={async (id) => {
          await deleteDraftPurchase(id)
          void mutate()
          router.push("/dashboard/purchases")
        }}
      />

      <PurchaseCancelDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open)
          if (!open) setCancelTarget(null)
        }}
        purchase={cancelTarget}
        onCancel={async (id, reason) => {
          await cancelPurchase(id, { cancel_reason: reason })
          void mutate()
        }}
      />
    </>
  )
}
