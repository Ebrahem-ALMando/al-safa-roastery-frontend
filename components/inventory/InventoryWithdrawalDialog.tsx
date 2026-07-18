"use client"

import { useMemo, useState } from "react"
import { Loader2, MinusCircle, X } from "lucide-react"
import { OperationNotesAccordion, OtherReasonHelper } from "@/components/shared/OperationNotesAccordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  formatInventoryQuantity,
  inventoryNumber,
  type InventoryItem,
  type WithdrawalReason,
  WITHDRAWAL_REASON_LABELS_AR,
  useInventoryActions,
} from "@/src/features/inventory"
import { InventoryOperationItemSelector } from "./InventoryOperationItemSelector"

export function InventoryWithdrawalDialog({ item, open, onOpenChange }: { item: InventoryItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(item)
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState<WithdrawalReason>("internal_use")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [itemError, setItemError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { withdraw } = useInventoryActions()
  const current = inventoryNumber(selectedItem?.current_quantity_kg)
  const value = inventoryNumber(quantity)
  const remaining = current - value
  const invalid = useMemo(() => quantity.trim() === "" || value <= 0 || value > current, [quantity, value, current])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setQuantity("")
      setReason("internal_use")
      setNotes("")
      setError("")
      setItemError("")
      setSelectedItem(item)
    }
    onOpenChange(next)
  }

  async function submit() {
    if (!selectedItem) {
      setItemError("اختر الصنف أولًا.")
      return
    }
    if (invalid) {
      setError(value > current ? "لا يمكن سحب كمية أكبر من الكمية المتاحة." : "أدخل كمية صحيحة أكبر من صفر.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await withdraw({ item_id: selectedItem.id, quantity_kg: value, reason, notes: notes.trim() || null })
      handleOpenChange(false)
    } catch {
      setError("تعذر تسجيل السحب. تحقق من البيانات وحاول مجددًا.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[94vh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b bg-linear-to-bl from-rose-500/10 via-background to-background px-6 py-5 text-right sm:text-right">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600"><MinusCircle className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <DialogTitle>سحب كمية من المخزون</DialogTitle>
              <DialogDescription className="mt-1.5 leading-relaxed">حدد الصنف والكمية وسبب السحب. ستُخصم الكمية ويُسجل أثرها مباشرة في حركات المخزون.</DialogDescription>
              <p className="mt-2 text-xs text-muted-foreground"><span className="text-destructive">*</span> يشير إلى حقل مطلوب.</p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" onClick={() => handleOpenChange(false)} aria-label="إغلاق"><X className="size-4" /></Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">الصنف <span className="text-destructive">*</span></h3>
            <InventoryOperationItemSelector item={selectedItem} onChange={(next) => { setSelectedItem(next); setItemError(""); setError("") }} error={itemError} disabled={submitting} />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">تفاصيل السحب</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الكمية المسحوبة (كغ) <span className="text-destructive">*</span></Label>
                <Input value={quantity} onChange={(event) => { setQuantity(event.target.value); setError("") }} inputMode="decimal" placeholder="مثال: 2.500" dir="ltr" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label>سبب السحب <span className="text-destructive">*</span></Label>
                <Select value={reason} onValueChange={(next) => setReason(next as WithdrawalReason)} disabled={submitting}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent dir="rtl">{Object.entries(WITHDRAWAL_REASON_LABELS_AR).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {reason === "other" ? <OtherReasonHelper /> : null}

            <div className={`rounded-xl border p-3 text-sm ${remaining < 0 ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-emerald-500/20 bg-emerald-500/5"}`}>
              الكمية بعد السحب: <strong className="tabular-nums" dir="ltr">{selectedItem ? formatInventoryQuantity(Math.max(0, remaining)) : "—"}</strong>
            </div>
            {error ? <p className="text-sm font-medium text-destructive" role="alert">{error}</p> : null}

            <OperationNotesAccordion value={notes} onChange={setNotes} placeholder="أضف تفاصيل مفيدة عن عملية السحب (اختياري)" tone="rose" disabled={submitting} />
          </section>
        </div>

        <div className="sticky bottom-0 z-10 flex shrink-0 flex-wrap gap-2 border-t bg-background/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.05)] backdrop-blur">
          <Button type="button" onClick={submit} disabled={submitting || !selectedItem} className="gap-2 rounded-xl">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <MinusCircle className="size-4" />}تسجيل السحب
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting} className="rounded-xl">إلغاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
