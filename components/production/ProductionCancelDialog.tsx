"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { productionBatchNumber, type ProductionBatch } from "@/src/features/production"

export function ProductionCancelDialog({ open, onOpenChange, batch, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; batch: ProductionBatch | null; onConfirm: (id: number, reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const close = (next: boolean) => { if (submitting) return; if (!next) setReason(""); onOpenChange(next) }
  const submit = async () => { if (!batch || !reason.trim()) return; setSubmitting(true); try { await onConfirm(batch.id, reason.trim()); setReason(""); onOpenChange(false) } finally { setSubmitting(false) } }
  return <AlertDialog open={open} onOpenChange={close}><AlertDialogContent dir="rtl" className="max-w-md"><AlertDialogHeader className="text-right"><AlertDialogTitle>إلغاء عملية الإنتاج؟</AlertDialogTitle><AlertDialogDescription>سيعكس النظام حركات المخزون للعملية <span className="font-mono font-semibold text-foreground" dir="ltr">{batch ? productionBatchNumber(batch) : ""}</span>. يجب أن تكون كمية الناتج متاحة لعكسها.</AlertDialogDescription></AlertDialogHeader><div className="space-y-2"><Label>سبب الإلغاء</Label><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="اكتب سبب الإلغاء..." rows={4} disabled={submitting} /></div><AlertDialogFooter className="gap-2"><AlertDialogCancel disabled={submitting}>تراجع</AlertDialogCancel><Button variant="destructive" disabled={!reason.trim() || submitting} onClick={() => void submit()}>{submitting ? <Loader2 className="size-4 animate-spin" /> : null}تأكيد الإلغاء</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
}
