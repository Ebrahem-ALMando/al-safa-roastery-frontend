"use client"

import { useMemo, useState } from "react"
import { ClipboardList, Loader2, MinusCircle, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatInventoryQuantity, inventoryNumber, type InventoryItem, type WithdrawalReason, WITHDRAWAL_REASON_LABELS_AR, useInventoryActions } from "@/src/features/inventory"
import { InventoryStockStatusBadge } from "./InventoryStockStatusBadge"

export function InventoryWithdrawalDialog({ item, open, onOpenChange }: { item: InventoryItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [quantity, setQuantity] = useState(""); const [reason, setReason] = useState<WithdrawalReason>("internal_use"); const [notes, setNotes] = useState(""); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false)
  const { withdraw } = useInventoryActions(); const current = inventoryNumber(item?.current_quantity_kg); const value = inventoryNumber(quantity); const remaining = current - value
  function handleOpenChange(next: boolean) { if (!next) { setQuantity(""); setReason("internal_use"); setNotes(""); setError("") }; onOpenChange(next) }
  const invalid = useMemo(() => quantity.trim() === "" || value <= 0 || value > current, [quantity, value, current])
  async function submit() { if (!item) return; if (invalid) { setError(value > current ? "لا يمكن سحب كمية أكبر من الكمية المتاحة." : "أدخل كمية صحيحة أكبر من صفر."); return }; setSubmitting(true); setError(""); try { await withdraw({ item_id: item.id, quantity_kg: value, reason, notes: notes.trim() || null }); handleOpenChange(false) } catch { /* toast handled centrally */ } finally { setSubmitting(false) } }
  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
    <DialogHeader className="border-b bg-linear-to-bl from-rose-500/10 via-background to-background px-6 py-5 text-right sm:text-right"><div className="flex items-start gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600"><MinusCircle className="size-5" /></span><div className="flex-1"><DialogTitle>سحب كمية من المخزون</DialogTitle><DialogDescription className="mt-1.5 leading-relaxed">حدد الصنف والكمية وسبب السحب. سيتم خصم الكمية من رصيد الصنف وتسجيل حركة مخزون.</DialogDescription><p className="mt-2 text-xs text-muted-foreground"><span className="text-destructive">*</span> يشير إلى حقل مطلوب.</p></div><Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}><X className="size-4" /></Button></div></DialogHeader>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">{item ? <section className="space-y-2"><h3 className="text-sm font-semibold">معلومات الصنف</h3><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/20 p-4"><div><p className="font-semibold">{item.name}</p><p className="font-mono text-xs text-muted-foreground" dir="ltr">{item.code}</p></div><div className="flex items-center gap-2"><InventoryStockStatusBadge item={item} /><span dir="ltr" className="text-sm font-semibold">{formatInventoryQuantity(current)}</span></div></div></section> : null}
      <section className="space-y-4"><h3 className="text-sm font-semibold">تفاصيل السحب</h3><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>الكمية المسحوبة (كغ) <span className="text-destructive">*</span></Label><Input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="decimal" placeholder="مثال: 2.500" dir="ltr" /></div><div className="space-y-2"><Label>سبب السحب <span className="text-destructive">*</span></Label><Select value={reason} onValueChange={(v) => setReason(v as WithdrawalReason)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(WITHDRAWAL_REASON_LABELS_AR).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div></div>
      <div className={`rounded-xl border p-3 text-sm ${remaining < 0 ? "border-destructive/40 bg-destructive/5 text-destructive" : "bg-emerald-500/5"}`}>الكمية بعد السحب: <strong dir="ltr">{formatInventoryQuantity(Math.max(0, remaining))}</strong></div>{error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Accordion type="single" collapsible><AccordionItem value="notes" className="overflow-hidden rounded-xl border"><AccordionTrigger className="px-4 hover:no-underline"><span className="flex items-center gap-2"><ClipboardList className="size-4 text-muted-foreground" />ملاحظات</span></AccordionTrigger><AccordionContent className="px-4 pb-4"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات السحب (اختياري)" /></AccordionContent></AccordionItem></Accordion></section></div>
    <div className="flex gap-2 border-t bg-muted/20 px-6 py-4"><Button onClick={submit} disabled={submitting || !item} className="gap-2 rounded-xl">{submitting ? <Loader2 className="size-4 animate-spin" /> : <MinusCircle className="size-4" />}تسجيل السحب</Button><Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">إلغاء</Button></div>
  </DialogContent></Dialog>
}
