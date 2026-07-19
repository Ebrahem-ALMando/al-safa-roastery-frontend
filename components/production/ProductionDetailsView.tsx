"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Ban,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Factory,
  FileText,
  History,
  Loader2,
  Package,
  Pencil,
  RefreshCw,
  Scale,
  Settings2,
  Trash2,
} from "lucide-react"
import { ItemTypeBadge } from "@/components/items/item-type-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  formatProductionCost,
  formatProductionDate,
  formatProductionMoney,
  formatProductionQuantity,
  productionBatchNumber,
  productionNumber,
  productionOutput,
  useProductionActions,
  useProductionDetails,
  type ProductionBatch,
  type ProductionItemRef,
  type ProductionMovement,
} from "@/src/features/production"
import { ProductionCancelDialog } from "./ProductionCancelDialog"
import { ProductionCompleteConfirmDialog } from "./ProductionCompleteConfirmDialog"
import { ProductionDeleteDialog } from "./ProductionDeleteDialog"
import { ProductionStatusBadge } from "./ProductionStatusBadge"

type MovementRow = {
  key: string
  movement: ProductionMovement
  item: ProductionItemRef | null
  reversal: boolean
}

export function ProductionDetailsView({ productionId }: { productionId: number }) {
  const router = useRouter()
  const details = useProductionDetails(productionId)
  const actions = useProductionActions()
  const [completeOpen, setCompleteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const batch = details.batch

  const movements = useMemo<MovementRow[]>(() => {
    if (!batch) return []
    const rows: MovementRow[] = []
    batch.inputs?.forEach((line) => {
      if (line.inventory_movement) rows.push({ key: `input-${line.id}`, movement: line.inventory_movement, item: line.raw_item ?? null, reversal: false })
      if (line.cancellation_inventory_movement) rows.push({ key: `input-cancel-${line.id}`, movement: line.cancellation_inventory_movement, item: line.raw_item ?? null, reversal: true })
    })
    batch.outputs?.forEach((line) => {
      if (line.inventory_movement) rows.push({ key: `output-${line.id}`, movement: line.inventory_movement, item: line.ready_item ?? null, reversal: false })
      if (line.cancellation_inventory_movement) rows.push({ key: `output-cancel-${line.id}`, movement: line.cancellation_inventory_movement, item: line.ready_item ?? null, reversal: true })
    })
    return rows.sort((a, b) => String(a.movement.movement_date ?? "").localeCompare(String(b.movement.movement_date ?? "")))
  }, [batch])

  if (details.isLoading) return <DetailsSkeleton />
  if (details.error || !batch) return <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-center" dir="rtl"><p className="text-sm text-muted-foreground">تعذر تحميل تفاصيل عملية الإنتاج.</p><Button variant="outline" className="gap-2" onClick={() => void details.mutate()}><RefreshCw className="size-4" />إعادة المحاولة</Button></div>

  const output = productionOutput(batch)
  const inputs = batch.inputs ?? []
  const estimatedInputCost = batch.status === "draft"
    ? inputs.reduce((total, line) => total + productionNumber(line.quantity_kg) * productionNumber(line.raw_item?.average_cost), 0)
    : productionNumber(batch.total_input_cost)
  const costPerKg = batch.status === "draft" && productionNumber(output?.quantity_kg) > 0
    ? estimatedInputCost / productionNumber(output?.quantity_kg)
    : productionNumber(batch.cost_per_output_kg)

  const refresh = async () => { await details.mutate() }

  return <div className="space-y-6 pb-10" dir="rtl" lang="ar">
    <header className="border-b pb-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="الرجوع إلى الإنتاج"><Link href="/dashboard/production"><ArrowRight className="size-5" /></Link></Button>
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-muted-foreground">الإنتاج / تفاصيل العملية</p>
            <div className="flex flex-wrap items-center gap-2"><h1 className="font-mono text-2xl font-bold" dir="ltr">{productionBatchNumber(batch)}</h1><ProductionStatusBadge status={batch.status} /></div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />تاريخ الإنتاج: {formatProductionDate(batch.production_date)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {batch.status === "draft" ? <Button variant="outline" className="gap-2" onClick={() => router.push(`/dashboard/production/${batch.id}/edit`)}><Pencil className="size-4" />تعديل المسودة</Button> : null}
          {batch.status === "draft" ? <Button className="gap-2" onClick={() => setCompleteOpen(true)}><CheckCircle2 className="size-4" />اعتماد</Button> : null}
          {batch.status === "completed" ? <Button variant="outline" className="gap-2 border-amber-500/40 text-amber-800" onClick={() => setCancelOpen(true)}><Ban className="size-4" />إلغاء العملية</Button> : null}
          {batch.status === "draft" ? <Button variant="outline" className="gap-2 text-destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" />حذف المسودة</Button> : null}
          <Button variant="ghost" asChild><Link href="/dashboard/production">رجوع</Link></Button>
        </div>
      </div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="ملخص العملية">
      <Stat icon={Scale} label="الكمية المنتجة" value={formatProductionQuantity(output?.quantity_kg ?? batch.total_output_weight_kg)} tone="sky" />
      <Stat icon={Factory} label="المواد الداخلة" value={`${inputs.length || batch.inputs_count || 0} صنف`} tone="emerald" />
      <Stat icon={CircleDollarSign} label="تكلفة المواد الداخلة" value={formatProductionMoney(estimatedInputCost)} tone="amber" />
      <Stat icon={Package} label="تكلفة الكيلو الناتج" value={formatProductionCost(costPerKg)} tone="violet" />
    </section>

    {batch.status === "cancelled" ? <section className="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4"><Ban className="mt-0.5 size-5 shrink-0 text-rose-700" /><div><h2 className="font-semibold text-rose-800">تم إلغاء هذه العملية وعكس أثرها المخزني</h2><p className="mt-1 text-sm text-muted-foreground">{batch.cancel_reason || "لم يُسجل سبب الإلغاء."}</p><p className="mt-1 text-xs text-muted-foreground">{formatProductionDate(batch.cancelled_at, true)}{batch.cancelled_by?.name ? ` · بواسطة ${batch.cancelled_by.name}` : ""}</p></div></section> : null}

    <DetailsSection icon={Package} title="الصنف الناتج">
      {output?.ready_item ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Detail label="الاسم" value={output.ready_item.name} className="sm:col-span-2" />
        <Detail label="الكود" value={output.ready_item.code || "—"} ltr />
        <Detail label="النوع" value={<ItemTypeBadge itemType={output.ready_item.item_type} />} />
        <Detail label="الكمية المنتجة" value={formatProductionQuantity(output.quantity_kg)} ltr />
        <Detail label="تكلفة الكيلو" value={formatProductionCost(costPerKg)} ltr />
        <Detail label="المخزون الحالي" value={<div className="flex flex-wrap items-center gap-2"><span dir="ltr">{formatProductionQuantity(output.ready_item.current_quantity_kg)}</span><Badge variant="outline" className={productionNumber(output.ready_item.current_quantity_kg) > 0 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700" : "border-rose-500/40 bg-rose-500/10 text-rose-700"}>{productionNumber(output.ready_item.current_quantity_kg) > 0 ? "متوفر" : "غير متوفر"}</Badge></div>} className="sm:col-span-2" />
        <Detail label="المتوسط السابق" value={formatProductionCost(output.previous_average_cost)} ltr />
        <Detail label="المتوسط بعد الإنتاج" value={formatProductionCost(output.new_average_cost ?? output.ready_item.average_cost)} ltr />
      </div> : <Empty text="لم يتم تحديد الصنف الناتج." />}
    </DetailsSection>

    <DetailsSection icon={Factory} title="المواد الداخلة">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead className="w-12 text-center">#</TableHead><TableHead className="text-right">الصنف</TableHead><TableHead className="text-center">الكود</TableHead><TableHead className="text-center">الكمية المستهلكة</TableHead><TableHead className="text-center">تكلفة الوحدة</TableHead><TableHead className="text-center">التكلفة الإجمالية</TableHead><TableHead className="text-center">المخزون قبل / بعد</TableHead></TableRow></TableHeader>
          <TableBody>{inputs.length ? inputs.map((line, index) => {
            const unitCost = batch.status === "draft" ? productionNumber(line.raw_item?.average_cost) : productionNumber(line.unit_cost)
            const totalCost = batch.status === "draft" ? unitCost * productionNumber(line.quantity_kg) : productionNumber(line.total_cost)
            return <TableRow key={line.id}><TableCell className="text-center font-mono text-xs">{index + 1}</TableCell><TableCell><p className="font-semibold">{line.raw_item?.name || `صنف #${line.raw_item_id}`}</p></TableCell><TableCell className="text-center font-mono text-xs" dir="ltr">{line.raw_item?.code || "—"}</TableCell><TableCell className="text-center" dir="ltr">{formatProductionQuantity(line.quantity_kg)}</TableCell><TableCell className="text-center" dir="ltr">{formatProductionCost(unitCost)}</TableCell><TableCell className="text-center font-semibold" dir="ltr">{formatProductionMoney(totalCost)}</TableCell><TableCell className="text-center text-xs" dir="ltr">{line.inventory_movement ? `${formatProductionQuantity(line.inventory_movement.quantity_before)} → ${formatProductionQuantity(line.inventory_movement.quantity_after)}` : "—"}</TableCell></TableRow>
          }) : <TableRow><TableCell colSpan={7}><Empty text="لا توجد مواد داخلة." /></TableCell></TableRow>}</TableBody>
        </Table>
      </div>
    </DetailsSection>

    <DetailsSection icon={History} title="حركات المخزون">
      {movements.length ? <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead className="text-right">الحركة</TableHead><TableHead className="text-right">الصنف</TableHead><TableHead className="text-center">الاتجاه</TableHead><TableHead className="text-center">الكمية</TableHead><TableHead className="text-center">الرصيد قبل / بعد</TableHead><TableHead className="text-center">التاريخ</TableHead><TableHead className="text-center">المرجع</TableHead></TableRow></TableHeader><TableBody>{movements.map((row) => <TableRow key={row.key}><TableCell><div className="flex items-center gap-2">{row.movement.direction === "in" ? <ArrowDownToLine className="size-4 text-emerald-600" /> : <ArrowUpFromLine className="size-4 text-rose-600" />}<span>{row.reversal ? "عكس العملية" : row.movement.movement_label_ar || "حركة إنتاج"}</span></div></TableCell><TableCell><p className="font-medium">{row.item?.name || "صنف غير متاح"}</p><p className="font-mono text-xs text-muted-foreground" dir="ltr">{row.item?.code || "—"}</p></TableCell><TableCell className="text-center"><DirectionBadge direction={row.movement.direction} /></TableCell><TableCell className="text-center" dir="ltr">{formatProductionQuantity(row.movement.quantity_kg)}</TableCell><TableCell className="text-center text-xs" dir="ltr">{formatProductionQuantity(row.movement.quantity_before)} → {formatProductionQuantity(row.movement.quantity_after)}</TableCell><TableCell className="text-center text-xs">{formatProductionDate(row.movement.movement_date, true)}</TableCell><TableCell className="text-center font-mono text-xs" dir="ltr">{row.movement.source_number || productionBatchNumber(batch)}</TableCell></TableRow>)}</TableBody></Table></div> : <Empty text={batch.status === "draft" ? "ستظهر حركات المخزون هنا بعد اعتماد العملية." : "لا تتوفر حركات مخزون مرتبطة بهذه العملية."} />}
    </DetailsSection>

    <div className="grid gap-6 lg:grid-cols-2">
      <DetailsSection icon={FileText} title="الملاحظات"><p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{batch.notes || "لا توجد ملاحظات."}</p></DetailsSection>
      <DetailsSection icon={Settings2} title="معلومات النظام"><dl className="grid gap-3 sm:grid-cols-2"><Detail label="تاريخ الإنشاء" value={formatProductionDate(batch.created_at, true)} /><Detail label="أنشأها" value={batch.created_by?.name || "—"} /><Detail label="آخر تحديث" value={formatProductionDate(batch.updated_at, true)} /><Detail label="اعتمدها" value={batch.completed_by?.name || "—"} /></dl></DetailsSection>
    </div>

    <ProductionCompleteConfirmDialog open={completeOpen} onOpenChange={setCompleteOpen} isSubmitting={submitting} preview={{ batchNumber: productionBatchNumber(batch), outputName: output?.ready_item?.name || "—", outputQuantity: formatProductionQuantity(output?.quantity_kg), inputsCount: inputs.length, totalInputCost: formatProductionMoney(estimatedInputCost), inventoryEffects: `سيتم سحب ${formatProductionQuantity(batch.total_input_weight_kg)} وإضافة ${formatProductionQuantity(output?.quantity_kg)} إلى مخزون الصنف الناتج.` }} onConfirm={async () => { setSubmitting(true); try { await actions.complete(batch.id); setCompleteOpen(false); await refresh() } finally { setSubmitting(false) } }} />
    <ProductionCancelDialog open={cancelOpen} onOpenChange={setCancelOpen} batch={batch} onConfirm={async (id, reason) => { await actions.cancel(id, { cancel_reason: reason }); await refresh() }} />
    <ProductionDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} batch={batch} onConfirm={async (id) => { await actions.deleteDraft(id); router.push("/dashboard/production") }} />
  </div>
}

function DetailsSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return <section className="space-y-3"><h2 className="flex items-center gap-2 text-base font-bold"><Icon className="size-5 text-primary" />{title}</h2><div className="rounded-lg border bg-card p-4 shadow-sm">{children}</div></section>
}

function Stat({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: "sky" | "emerald" | "amber" | "violet" }) {
  const tones = { sky: "bg-sky-500/10 text-sky-700", emerald: "bg-emerald-500/10 text-emerald-700", amber: "bg-amber-500/10 text-amber-800", violet: "bg-violet-500/10 text-violet-700" }
  return <div className="flex items-start gap-3 rounded-lg border bg-card p-4 shadow-sm"><span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tones[tone])}><Icon className="size-5" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-bold tabular-nums" dir="ltr">{value}</p></div></div>
}

function Detail({ label, value, ltr, className }: { label: string; value: React.ReactNode; ltr?: boolean; className?: string }) {
  return <div className={cn("rounded-lg border bg-muted/10 p-3", className)}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1.5 text-sm font-semibold" dir={ltr ? "ltr" : undefined}>{value}</dd></div>
}

function Empty({ text }: { text: string }) { return <div className="flex min-h-24 items-center justify-center text-center text-sm text-muted-foreground">{text}</div> }

function DirectionBadge({ direction }: { direction: "in" | "out" }) { return <Badge variant="outline" className={direction === "in" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700" : "border-rose-500/40 bg-rose-500/10 text-rose-700"}>{direction === "in" ? "وارد" : "صادر"}</Badge> }

function DetailsSkeleton() { return <div className="space-y-6" dir="rtl"><Skeleton className="h-20 w-full" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div><Skeleton className="h-52 w-full" /><Skeleton className="h-72 w-full" /></div> }
