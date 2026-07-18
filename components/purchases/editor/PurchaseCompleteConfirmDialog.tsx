"use client"

import type { ReactNode } from "react"
import {
  BadgePercent,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Info,
  Loader2,
  PackageCheck,
  Truck,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  calculateRemaining,
  calculateSubtotal,
  calculateTotal,
  formatUsd,
  type PurchaseEditorFormState,
} from "@/features/purchases"

type PurchaseCompleteConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  form: PurchaseEditorFormState
  isSubmitting?: boolean
}

function numberValue(value: string | number | null | undefined): number {
  const parsed = Number.parseFloat(String(value ?? "").replaceAll(",", ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatQuantity(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 3 })} كغ`
}

export function PurchaseCompleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  form,
  isSubmitting = false,
}: PurchaseCompleteConfirmDialogProps) {
  const subtotal = calculateSubtotal(form.lines)
  const total = calculateTotal(subtotal, form.discount)
  const remaining = calculateRemaining(total, form.paidAmount)
  const totalQuantity = form.lines.reduce((sum, line) => sum + numberValue(line.quantityKg), 0)

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!isSubmitting) onOpenChange(next) }}>
      <AlertDialogContent
        dir="rtl"
        lang="ar"
        className="flex max-h-[min(94vh,860px)] flex-col gap-0 overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-2xl"
      >
        <AlertDialogHeader className="shrink-0 border-b bg-linear-to-bl from-emerald-500/10 via-background to-background px-6 py-5 text-right sm:text-right">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/10 dark:text-emerald-400">
              <BadgeCheck className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <AlertDialogTitle className="text-xl">تأكيد اعتماد الفاتورة</AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5 text-right leading-6">
                سيتم اعتماد الفاتورة وتحديث المخزون ورصيد المورد وحركات الصندوق عند وجود مبلغ مدفوع.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <ReviewSection icon={Truck} title="المورد">
            <div className="flex min-w-0 items-center gap-3 sm:col-span-2">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Truck className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{form.supplier?.name ?? "غير محدد"}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>الكود: <b className="font-mono text-foreground" dir="ltr">{form.supplier?.code || "—"}</b></span>
                  <span>الهاتف: <b className="font-mono text-foreground" dir="ltr">{form.supplier?.phone || "—"}</b></span>
                  <span>الرصيد الحالي: <b className="font-mono text-foreground" dir="ltr">{formatUsd(numberValue(form.supplier?.current_balance))}</b></span>
                </div>
              </div>
            </div>
          </ReviewSection>

          <ReviewSection icon={CircleDollarSign} title="ملخص الفاتورة">
            <ReviewValue icon={PackageCheck} label="عدد الأصناف" value={`${form.lines.length} صنف`} />
            <ReviewValue icon={PackageCheck} label="إجمالي الكمية" value={formatQuantity(totalQuantity)} ltr />
            <ReviewValue icon={CircleDollarSign} label="الإجمالي" value={formatUsd(total)} ltr strong />
            <ReviewValue icon={BadgePercent} label="الخصم" value={formatUsd(form.discount)} ltr />
            <ReviewValue icon={WalletCards} label="المدفوع" value={formatUsd(form.paidAmount)} ltr />
            <ReviewValue icon={CircleDollarSign} label="المتبقي" value={formatUsd(remaining)} ltr strong />
          </ReviewSection>

          <ReviewSection icon={Check} title="الأثر المتوقع">
            <EffectLine>سيتم تحديث كميات الأصناف في المخزون.</EffectLine>
            <EffectLine>سيتم تحديث رصيد المورد.</EffectLine>
            <EffectLine muted={numberValue(form.paidAmount) <= 0}>سيتم تسجيل حركة صندوق إذا كان هناك مبلغ مدفوع.</EffectLine>
          </ReviewSection>

          <div className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/30 dark:text-amber-100">
            <Info className="mt-1 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>لا يمكن تعديل الفاتورة بعد اعتمادها. يمكن التراجع فقط عبر إلغاء الفاتورة حسب الصلاحيات.</p>
          </div>
        </div>

        <AlertDialogFooter className="shrink-0 flex-row-reverse justify-start border-t bg-background/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.05)] sm:justify-start">
          <AlertDialogAction onClick={(event) => { event.preventDefault(); onConfirm() }} disabled={isSubmitting} className="min-w-36 gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            {isSubmitting ? <><Loader2 className="size-4 animate-spin" />جارٍ الاعتماد</> : <><Check className="size-4" />اعتماد الفاتورة</>}
          </AlertDialogAction>
          <AlertDialogCancel asChild><Button type="button" variant="outline" className="rounded-xl" disabled={isSubmitting}>رجوع</Button></AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ReviewSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function ReviewValue({ icon: Icon, label, value, ltr = false, strong = false }: { icon: LucideIcon; label: string; value: string; ltr?: boolean; strong?: boolean }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-xl border bg-muted/15 px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground"><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{label}</p><p className={strong ? "mt-1 font-extrabold text-primary" : "mt-1 font-semibold"} dir={ltr ? "ltr" : undefined}>{value}</p></div>
    </div>
  )
}

function EffectLine({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <p className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}><Check className="size-4 shrink-0 text-emerald-600" />{children}</p>
}
