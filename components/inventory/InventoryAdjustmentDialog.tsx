"use client"

import { useState } from "react"
import { Loader2, SlidersHorizontal, X } from "lucide-react"
import { OperationNotesAccordion, OtherReasonHelper } from "@/components/shared/OperationNotesAccordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ADJUSTMENT_REASON_LABELS_AR,
  formatInventoryCost,
  formatInventoryQuantity,
  inventoryNumber,
  type AdjustmentReason,
  type InventoryItem,
  useInventoryActions,
} from "@/src/features/inventory"
import { InventoryOperationItemSelector } from "./InventoryOperationItemSelector"

export function InventoryAdjustmentDialog({ item, open, onOpenChange }: { item: InventoryItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(item)
  const [actual, setActual] = useState("")
  const [reason, setReason] = useState<AdjustmentReason>("stock_count")
  const [unitCost, setUnitCost] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [itemError, setItemError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { adjust } = useInventoryActions()
  const current = inventoryNumber(selectedItem?.current_quantity_kg)
  const actualValue = inventoryNumber(actual)
  const difference = actual.trim() ? actualValue - current : 0
  const needsCost = difference > 0 && inventoryNumber(selectedItem?.average_cost) <= 0

  function handleOpenChange(next: boolean) {
    if (!next) {
      setActual("")
      setReason("stock_count")
      setUnitCost("")
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
    if (actual.trim() === "" || actualValue < 0) {
      setError("أدخل كمية فعلية صحيحة.")
      return
    }
    if (Math.abs(difference) < 0.0005) {
      setError("لا يوجد فرق بين الكمية الحالية والكمية الفعلية.")
      return
    }
    if (needsCost && inventoryNumber(unitCost) <= 0) {
      setError("أدخل تكلفة الوحدة لتسجيل الزيادة لهذا الصنف.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await adjust({ item_id: selectedItem.id, actual_quantity_kg: actualValue, reason, unit_cost: needsCost ? inventoryNumber(unitCost) : undefined, notes: notes.trim() || null })
      handleOpenChange(false)
    } catch {
      setError("تعذر تسجيل التسوية. تحقق من البيانات وحاول مجددًا.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[94vh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b bg-linear-to-bl from-amber-500/10 via-background to-background px-6 py-5 text-right sm:text-right">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600"><SlidersHorizontal className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <DialogTitle>تسوية المخزون</DialogTitle>
              <DialogDescription className="mt-1.5 leading-relaxed">أدخل الكمية الفعلية بعد الجرد، وسيحسب النظام الفرق ويسجل حركة مخزون موجبة أو سالبة.</DialogDescription>
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
            <h3 className="text-sm font-semibold">بيانات التسوية</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الكمية الفعلية (كغ) <span className="text-destructive">*</span></Label>
                <Input value={actual} onChange={(event) => { setActual(event.target.value); setError("") }} inputMode="decimal" placeholder="مثال: 97.000" dir="ltr" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label>سبب التسوية <span className="text-destructive">*</span></Label>
                <Select value={reason} onValueChange={(next) => setReason(next as AdjustmentReason)} disabled={submitting}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent dir="rtl">{Object.entries(ADJUSTMENT_REASON_LABELS_AR).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {needsCost ? (
              <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <Label>تكلفة الوحدة (USD / كغ) <span className="text-destructive">*</span></Label>
                <Input value={unitCost} onChange={(event) => { setUnitCost(event.target.value); setError("") }} inputMode="decimal" dir="ltr" disabled={submitting} />
                <p className="text-xs text-muted-foreground">متوسط تكلفة الصنف يساوي صفرًا، لذلك تلزم تكلفة للكمية المضافة.</p>
              </div>
            ) : selectedItem ? <p className="text-xs text-muted-foreground">متوسط التكلفة الحالي: <span dir="ltr">{formatInventoryCost(selectedItem.average_cost)}</span></p> : null}

            {reason === "other" ? <OtherReasonHelper /> : null}

            <div className="grid gap-2 rounded-xl border bg-muted/15 p-3 text-sm sm:grid-cols-3">
              <span>الحالية: <strong dir="ltr">{selectedItem ? formatInventoryQuantity(current) : "—"}</strong></span>
              <span>الفعلية: <strong dir="ltr">{actual.trim() ? formatInventoryQuantity(actualValue) : "—"}</strong></span>
              <span className={difference > 0 ? "text-emerald-700" : difference < 0 ? "text-rose-700" : "text-muted-foreground"}>
                الفرق: <strong dir="ltr">{difference > 0 ? `+${formatInventoryQuantity(difference)}` : difference < 0 ? `-${formatInventoryQuantity(Math.abs(difference))}` : "لا يوجد فرق"}</strong>
              </span>
            </div>
            {error ? <p className="text-sm font-medium text-destructive" role="alert">{error}</p> : null}

            <OperationNotesAccordion value={notes} onChange={setNotes} placeholder="أضف تفاصيل الجرد أو سبب الفرق (اختياري)" tone="amber" disabled={submitting} />
          </section>
        </div>

        <div className="sticky bottom-0 z-10 flex shrink-0 flex-wrap gap-2 border-t bg-background/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.05)] backdrop-blur">
          <Button type="button" onClick={submit} disabled={submitting || !selectedItem} className="gap-2 rounded-xl">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <SlidersHorizontal className="size-4" />}تسجيل التسوية
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting} className="rounded-xl">إلغاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
