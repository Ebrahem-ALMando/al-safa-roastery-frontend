"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Factory, Loader2, Package, Plus, Save, Scale, Trash2, X } from "lucide-react"
import { ItemPickerDialog } from "@/components/purchases/editor/ItemPickerDialog"
import { OperationNotesAccordion } from "@/components/shared/OperationNotesAccordion"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { ItemTypeBadge } from "@/components/items/item-type-badge"
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"
import { formatLocalYmd } from "@/lib/date-scope/resolve-operational-date-range"
import { cn } from "@/lib/utils"
import { ApiRequestError } from "@/lib/api"
import { formatProductionCost, formatProductionMoney, formatProductionQuantity, productionNumber, productionOutput, useProductionActions, useProductionDetails, type SaveProductionInput } from "@/src/features/production"
import { ProductionCompleteConfirmDialog } from "../ProductionCompleteConfirmDialog"

type InputLine = { key: string; item: ItemPickerRow; quantity: string }
type FormState = { productionDate: string; notes: string; output: ItemPickerRow | null; outputQuantity: string; inputs: InputLine[] }
type Errors = { productionDate?: string; output?: string; outputQuantity?: string; inputs?: string; lines: Record<string, string> }

const emptyForm = (): FormState => ({ productionDate: formatLocalYmd(new Date()), notes: "", output: null, outputQuantity: "", inputs: [] })
const rowFromItem = (item: { id: number; name: string; code: string | null; item_type: "raw" | "ready"; current_quantity_kg: string | number | null; average_cost: string | number | null }): ItemPickerRow => ({ id: String(item.id), name: item.name, code: item.code || "—", itemType: item.item_type, currentQuantityKg: item.current_quantity_kg, averageCost: item.average_cost, lastPurchasePrice: null })

export function ProductionEditor({ mode, productionId }: { mode: "create" | "edit"; productionId?: number }) {
  const router = useRouter()
  const isEdit = mode === "edit" && productionId != null
  const details = useProductionDetails(isEdit ? productionId : null)
  const actions = useProductionActions()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm)
  const [hydrated, setHydrated] = useState(!isEdit)
  const [errors, setErrors] = useState<Errors>({ lines: {} })
  const [inputPickerOpen, setInputPickerOpen] = useState(false)
  const [outputPickerOpen, setOutputPickerOpen] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activeLine, setActiveLine] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const lock = useRef(false)

  useEffect(() => {
    if (!isEdit || !details.batch || hydrated) return
    if (details.batch.status !== "draft") { toast.error("لا يمكن تعديل عملية إنتاج معتمدة أو ملغاة."); router.replace(`/dashboard/production/${details.batch.id}`); return }
    const output = productionOutput(details.batch)
    const next: FormState = {
      productionDate: details.batch.production_date,
      notes: details.batch.notes ?? "",
      output: output?.ready_item ? rowFromItem(output.ready_item) : null,
      outputQuantity: output ? String(output.quantity_kg) : "",
      inputs: (details.batch.inputs ?? []).filter((line) => line.raw_item).map((line) => ({ key: crypto.randomUUID(), item: rowFromItem(line.raw_item!), quantity: String(line.quantity_kg) })),
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the draft once from the API response
    setForm(next); setInitialForm(next); setHydrated(true)
  }, [details.batch, hydrated, isEdit, router])

  const totals = useMemo(() => {
    const inputQuantity = form.inputs.reduce((sum, line) => sum + productionNumber(line.quantity), 0)
    const inputCost = form.inputs.reduce((sum, line) => sum + productionNumber(line.quantity) * productionNumber(line.item.averageCost), 0)
    const outputQuantity = productionNumber(form.outputQuantity)
    return { inputQuantity, inputCost, outputQuantity, costPerOutput: outputQuantity > 0 ? inputCost / outputQuantity : 0, waste: Math.max(0, inputQuantity - outputQuantity) }
  }, [form.inputs, form.outputQuantity])

  const patch = useCallback((value: Partial<FormState>) => { setForm((current) => ({ ...current, ...value })); setErrors({ lines: {} }) }, [])
  const addItems = (rows: ItemPickerRow[]) => {
    const fresh = rows.filter((row) => !form.inputs.some((line) => line.item.id === row.id)).map((item) => ({ key: crypto.randomUUID(), item, quantity: "" }))
    if (!fresh.length) return
    patch({ inputs: [...form.inputs, ...fresh] }); setActiveLine(fresh[0].key)
  }
  const updateLine = (key: string, quantity: string) => patch({ inputs: form.inputs.map((line) => line.key === key ? { ...line, quantity } : line) })
  const focusLine = useCallback((key: string) => {
    setActiveLine(key)
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-production-field="line-${key}"]`)?.focus())
  }, [])
  const removeLine = useCallback((key: string) => {
    const index = form.inputs.findIndex((line) => line.key === key)
    const next = form.inputs.filter((line) => line.key !== key)
    patch({ inputs: next })
    const nextKey = next[Math.min(index, Math.max(0, next.length - 1))]?.key
    if (nextKey) focusLine(nextKey)
    else setActiveLine(null)
  }, [focusLine, form.inputs, patch])

  const validate = useCallback((): Errors => {
    const next: Errors = { lines: {} }
    if (!form.productionDate) next.productionDate = "تاريخ الإنتاج مطلوب."
    if (!form.output) next.output = "يجب اختيار الصنف الناتج."
    if (productionNumber(form.outputQuantity) <= 0) next.outputQuantity = "يجب أن تكون كمية الناتج أكبر من صفر."
    if (!form.inputs.length) next.inputs = "يجب إضافة مادة داخلة واحدة على الأقل."
    form.inputs.forEach((line) => {
      const quantity = productionNumber(line.quantity)
      const available = productionNumber(line.item.currentQuantityKg)
      if (quantity <= 0) next.lines[line.key] = "أدخل كمية أكبر من صفر."
      else if (quantity > available) next.lines[line.key] = "الكمية المدخلة تتجاوز المخزون المتاح."
    })
    if (totals.outputQuantity > totals.inputQuantity && totals.inputQuantity > 0) next.outputQuantity = "لا يمكن أن تتجاوز كمية الناتج إجمالي المواد الداخلة."
    return next
  }, [form, totals.inputQuantity, totals.outputQuantity])

  const focusFirstInvalid = useCallback((next: Errors) => {
    window.setTimeout(() => {
      const lineKey = Object.keys(next.lines)[0]
      const field = next.productionDate ? "date" : next.output ? "output" : next.outputQuantity ? "output-quantity" : next.inputs ? "inputs" : lineKey ? `line-${lineKey}` : null
      const target = field ? document.querySelector<HTMLElement>(`[data-production-field="${field}"]`) : null
      target?.scrollIntoView({ behavior: "smooth", block: "center" }); target?.focus({ preventScroll: true })
    }, 0)
  }, [])
  const ensureValid = useCallback(() => { const next = validate(); if (next.productionDate || next.output || next.outputQuantity || next.inputs || Object.keys(next.lines).length) { setErrors(next); focusFirstInvalid(next); toast.error("يرجى تصحيح بيانات الإنتاج قبل المتابعة."); return false } return true }, [focusFirstInvalid, validate])

  const payload = (): SaveProductionInput => ({ production_date: form.productionDate, notes: form.notes.trim() || null, additional_cost: 0, inputs: form.inputs.map((line) => ({ raw_item_id: Number(line.item.id), quantity_kg: productionNumber(line.quantity) })), outputs: [{ ready_item_id: Number(form.output!.id), quantity_kg: productionNumber(form.outputQuantity) }] })
  const saveDraft = async () => {
    if (lock.current || !ensureValid()) return null
    lock.current = true; setSaving(true)
    try { const result = isEdit && productionId ? await actions.updateDraft(productionId, payload()) : await actions.createDraft(payload()); setInitialForm(form); if (!isEdit) router.replace(`/dashboard/production/${result.id}/edit`); return result.id }
    catch (error) { toast.error(error instanceof ApiRequestError && error.code === "INSUFFICIENT_STOCK" ? "الكمية المدخلة تتجاوز المخزون المتاح." : "تعذر تسجيل عملية الإنتاج. حاول مجدداً."); return null }
    finally { setSaving(false); lock.current = false }
  }
  const complete = async () => {
    if (lock.current || !ensureValid()) return
    lock.current = true; setCompleting(true)
    let draftId = isEdit ? productionId ?? null : null
    try {
      if (draftId) { if (JSON.stringify(form) !== JSON.stringify(initialForm)) await actions.updateDraft(draftId, payload()) }
      else { draftId = (await actions.createDraft(payload())).id }
      const result = await actions.complete(draftId); setConfirmOpen(false); router.push(`/dashboard/production/${result.id}`)
    } catch (error) {
      if (!isEdit && draftId) router.replace(`/dashboard/production/${draftId}/edit`)
      const message = error instanceof ApiRequestError && error.code === "INSUFFICIENT_STOCK" ? "الكمية المدخلة تتجاوز المخزون المتاح." : "تعذر اعتماد عملية الإنتاج. راجع المخزون وحاول مجدداً."
      toast.error(message); setConfirmOpen(false)
    } finally { setCompleting(false); lock.current = false }
  }
  const openConfirm = useCallback(() => { if (ensureValid()) setConfirmOpen(true) }, [ensureValid])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (inputPickerOpen || outputPickerOpen || confirmOpen || deleteAllOpen) return
      if (event.code === "KeyN") { event.preventDefault(); setInputPickerOpen(true); return }
      if (event.code === "Delete" && activeLine) { event.preventDefault(); removeLine(activeLine); return }
      if (event.code === "Enter" || event.code === "NumpadEnter") { event.preventDefault(); openConfirm() }
    }
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler)
  }, [activeLine, confirmOpen, deleteAllOpen, inputPickerOpen, openConfirm, outputPickerOpen, removeLine])

  if (isEdit && (details.isLoading || !hydrated)) return <div className="space-y-5" dir="rtl"><Skeleton className="h-12 w-72" /><Skeleton className="h-[34rem] rounded-2xl" /></div>
  if (isEdit && details.error) return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive" dir="rtl">تعذر تحميل مسودة الإنتاج.</div>

  return <div className="space-y-6 pb-8" dir="rtl" lang="ar">
    <div className="flex items-start gap-3"><Button asChild variant="ghost" size="icon" className="rounded-xl"><Link href="/dashboard/production"><ArrowRight className="size-5" /></Link></Button><div><p className="text-xs text-muted-foreground">الإنتاج / {isEdit ? "تعديل المسودة" : "عملية جديدة"}</p><h1 className="text-2xl font-bold">{isEdit ? "تعديل مسودة الإنتاج" : "إنشاء عملية إنتاج"}</h1><p className="mt-1 text-sm text-muted-foreground">حدد الناتج والمواد الداخلة، ثم احفظ المسودة أو اعتمدها لتسجيل حركات المخزون.</p></div></div>
    <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2">
      <Section title="معلومات العملية" icon={Factory}><div className="space-y-2"><Label>تاريخ الإنتاج <span className="text-destructive">*</span></Label><Input type="date" value={form.productionDate} onChange={(event) => patch({ productionDate: event.target.value })} data-production-field="date" /><ErrorSlot text={errors.productionDate} /></div><OperationNotesAccordion value={form.notes} onChange={(notes) => patch({ notes })} placeholder="أضف ملاحظات خاصة بعملية الإنتاج (اختياري)" tone="amber" /></Section>
      <Section title="الصنف الناتج" icon={Package}><div className="space-y-3" data-production-field="output" tabIndex={-1}>{form.output ? <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/15 p-4"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Package className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-semibold">{form.output.name}</p><p className="font-mono text-xs text-muted-foreground" dir="ltr">{form.output.code}</p></div><ItemTypeBadge itemType={form.output.itemType} /><Button variant="outline" size="sm" onClick={() => setOutputPickerOpen(true)}>تغيير</Button></div> : <Button type="button" variant="outline" className="h-16 w-full justify-start gap-3 border-dashed" onClick={() => setOutputPickerOpen(true)}><Plus className="size-5" />اختيار الصنف الجاهز الناتج</Button>}<ErrorSlot text={errors.output} />{form.output ? <div className="grid gap-3 sm:grid-cols-3"><Mini label="المخزون الحالي" value={formatProductionQuantity(form.output.currentQuantityKg)} /><Mini label="متوسط التكلفة" value={formatProductionCost(form.output.averageCost)} /><div className="space-y-1"><Label>الكمية الناتجة (كغ) <span className="text-destructive">*</span></Label><Input value={form.outputQuantity} onChange={(event) => patch({ outputQuantity: event.target.value })} inputMode="decimal" dir="ltr" data-production-field="output-quantity" /><ErrorSlot text={errors.outputQuantity} /></div></div> : null}</div></Section>
      <Section title="المواد الداخلة" icon={Scale} action={<div className="flex gap-2"><Button size="sm" className="gap-2" onClick={() => setInputPickerOpen(true)}><Plus className="size-4" />إضافة أصناف</Button>{form.inputs.length ? <Button size="sm" variant="outline" className="gap-2 text-destructive" onClick={() => setDeleteAllOpen(true)}><Trash2 className="size-4" />حذف الكل</Button> : null}</div>}><div data-production-field="inputs" tabIndex={-1}><ErrorSlot text={errors.inputs} />{form.inputs.length ? <div className="space-y-2">{form.inputs.map((line, index) => { const available = productionNumber(line.item.currentQuantityKg); const cost = productionNumber(line.quantity) * productionNumber(line.item.averageCost); return <div key={line.key} data-production-field={`line-${line.key}`} tabIndex={0} onFocus={() => setActiveLine(line.key)} onClick={() => setActiveLine(line.key)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); focusLine(form.inputs[Math.min(index + 1, form.inputs.length - 1)].key) } if (event.key === "ArrowUp") { event.preventDefault(); focusLine(form.inputs[Math.max(index - 1, 0)].key) } }} className={cn("grid gap-3 rounded-xl border p-3 transition sm:grid-cols-[2rem_minmax(0,1fr)_9rem_8rem_2rem] sm:items-start", activeLine === line.key && "border-primary/50 ring-2 ring-primary/15")}><span className="pt-2 text-center font-mono text-xs text-muted-foreground">{index + 1}</span><div className="min-w-0 pt-1"><p className="truncate font-semibold">{line.item.name}</p><p className="text-xs text-muted-foreground"><span dir="ltr">{line.item.code}</span> · متاح {formatProductionQuantity(available)} · {formatProductionCost(line.item.averageCost)}</p></div><div><Input value={line.quantity} onChange={(event) => updateLine(line.key, event.target.value)} inputMode="decimal" dir="ltr" placeholder="الكمية" /><ErrorSlot text={errors.lines[line.key]} /></div><p className="pt-2 text-center text-sm font-semibold" dir="ltr">{formatProductionMoney(cost)}</p><Button variant="ghost" size="icon-sm" className="mt-1 text-destructive" onClick={() => removeLine(line.key)}><X className="size-4" /></Button></div> })}</div> : <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 text-center"><Scale className="mb-2 size-7 text-muted-foreground" /><p className="font-semibold">لم تتم إضافة مواد داخلة بعد.</p></div>}</div></Section>
    </div><aside className="lg:sticky lg:top-24 lg:self-start"><div className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="border-b bg-primary/5 p-4"><h2 className="flex items-center gap-2 font-bold"><Factory className="size-5 text-primary" />ملخص الإنتاج</h2></div><div className="space-y-3 p-4"><SummaryLine label="عدد المواد الداخلة" value={`${form.inputs.length} صنف`} /><SummaryLine label="إجمالي كمية المدخلات" value={formatProductionQuantity(totals.inputQuantity)} /><SummaryLine label="كمية الناتج" value={formatProductionQuantity(totals.outputQuantity)} /><SummaryLine label="تكلفة المواد الداخلة" value={formatProductionMoney(totals.inputCost)} /><SummaryLine label="تكلفة الكيلو الناتج" value={formatProductionCost(totals.costPerOutput)} strong /><SummaryLine label="الفاقد المتوقع" value={formatProductionQuantity(totals.waste)} /><div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-800">عند الاعتماد ستُسحب المواد الداخلة ويُضاف الناتج إلى المخزون.</div></div><div className="grid gap-2 border-t p-4"><Button className="gap-2" onClick={openConfirm} disabled={saving || completing}><Check className="size-4" />اعتماد الإنتاج</Button><Button variant="outline" className="gap-2" onClick={() => void saveDraft()} disabled={saving || completing}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}حفظ كمسودة</Button><Button variant="ghost" asChild><Link href="/dashboard/production">إلغاء</Link></Button></div></div></aside></div>
    <ItemPickerDialog open={outputPickerOpen} onOpenChange={setOutputPickerOpen} onSelect={(output) => patch({ output })} selectionMode="single" variant="operation" selectedItemId={form.output?.id} searchMode="local" itemType="ready" activeOnly title="اختيار الصنف الناتج" description="ابحث بالاسم أو الكود ثم اختر صنفاً جاهزاً واحداً." singleSelectionHint="اختر صنفاً جاهزاً واحداً ليكون ناتج العملية." />
    <ItemPickerDialog open={inputPickerOpen} onOpenChange={setInputPickerOpen} onSelect={(row) => addItems([row])} onSelectMany={addItems} excludeItemIds={form.inputs.map((line) => Number(line.item.id))} selectionMode="multiple" searchMode="local" itemType="raw" activeOnly title="إضافة المواد الداخلة" description="اختر مادة خام واحدة أو أكثر لإضافتها إلى عملية الإنتاج." />
    <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}><AlertDialogContent dir="rtl"><AlertDialogHeader className="text-right"><AlertDialogTitle>حذف جميع المواد الداخلة؟</AlertDialogTitle><AlertDialogDescription>سيتم تفريغ قائمة المدخلات الحالية.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>تراجع</AlertDialogCancel><AlertDialogAction onClick={() => { patch({ inputs: [] }); setActiveLine(null) }}>حذف الكل</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <ProductionCompleteConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} isSubmitting={completing} preview={{ outputName: form.output?.name ?? "—", outputQuantity: formatProductionQuantity(totals.outputQuantity), inputsCount: form.inputs.length, totalInputCost: formatProductionMoney(totals.inputCost), inventoryEffects: `سحب ${formatProductionQuantity(totals.inputQuantity)} من المواد وإضافة ${formatProductionQuantity(totals.outputQuantity)} إلى الصنف الناتج.` }} onConfirm={complete} />
  </div>
}

function Section({ title, icon: Icon, action, children }: { title: string; icon: React.ElementType; action?: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-2xl border bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"><h2 className="flex items-center gap-2 font-bold"><Icon className="size-5 text-primary" />{title}</h2>{action}</div><div className="space-y-4 p-5">{children}</div></section> }
function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border bg-muted/10 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-semibold" dir="ltr">{value}</p></div> }
function ErrorSlot({ text }: { text?: string }) { return <p className={cn("min-h-5 text-xs", text ? "text-destructive" : "text-transparent")}>{text ?? "—"}</p> }
function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <div className={cn("flex items-center justify-between gap-3 text-sm", strong && "border-t pt-3")}><span className="text-muted-foreground">{label}</span><span className={cn("tabular-nums", strong && "text-base font-bold")} dir="ltr">{value}</span></div> }
