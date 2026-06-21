"use client"

import { useParams } from "next/navigation"
import { ResultEntryView } from "@/components/results/result-entry/result-entry-view"

export default function ResultEntryPage() {
  const params = useParams()
  const raw = params.id
  const id = typeof raw === "string" ? Number(raw) : NaN
  const orderId = Number.isFinite(id) && id > 0 ? id : null

  return <ResultEntryView orderId={orderId} />
}
