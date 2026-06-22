"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { usePurchaseDetails } from "@/features/purchases"
import { PurchasePrintView } from "@/components/purchases/PurchasePrintView"

export default function PurchasePrintPage() {
  const params = useParams<{ purchaseId: string }>()
  const router = useRouter()
  const raw = params?.purchaseId
  const idNum = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN
  const purchaseId = Number.isFinite(idNum) && idNum > 0 ? idNum : null

  const { purchase, isLoading, error } = usePurchaseDetails(purchaseId)

  useEffect(() => {
    if (!purchase) return
    if (purchase.status === "draft") {
      router.replace(`/dashboard/purchases/${purchase.id}`)
    }
  }, [purchase, router])

  if (purchaseId === null) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-white p-4 text-destructive">
        معرّف الفاتورة غير صالح
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white p-8 text-muted-foreground"
      >
        <Loader2 className="size-10 animate-spin" />
        <p>جاري تحميل الفاتورة…</p>
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-white p-4 text-destructive">
        تعذر تحميل بيانات الفاتورة
      </div>
    )
  }

  if (purchase.status === "draft") {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-white p-4 text-muted-foreground">
        لا يمكن طباعة المسودة
      </div>
    )
  }

  return <PurchasePrintView purchase={purchase} />
}
