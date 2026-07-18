"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowUpLeft,
  CalendarClock,
  CircleDollarSign,
  FileText,
  Loader2,
  ReceiptText,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CASHBOX_PAYMENT_METHOD_LABELS_AR,
  CASHBOX_SOURCE_TYPE_LABELS_AR,
  CASHBOX_TRANSACTION_TYPE_LABELS_AR,
  cashboxSourceDetailsHref,
  formatCashboxDate,
  formatCashboxMoney,
  type CashboxTransactionType,
  useCashboxTransactionDetails,
} from "@/src/features/cashbox"
import { CashboxDirectionBadge } from "./CashboxDirectionBadge"

export function CashboxTransactionDetailsDialog({ transactionId, open, onOpenChange }: {
  transactionId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { transaction, isLoading, error } = useCashboxTransactionDetails(transactionId, open)
  const sourceHref = transaction ? cashboxSourceDetailsHref(transaction.source_type, transaction.source_id) : null
  const sourceLabel = transaction?.source_type
    ? CASHBOX_SOURCE_TYPE_LABELS_AR[transaction.source_type] ?? transaction.source_type
    : "أخرى"
  const reference = transaction?.source_number || (transaction?.source_id ? `#${transaction.source_id}` : "—")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(92vh,820px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-[760px]"
        dir="rtl"
        lang="ar"
      >
        <div className="shrink-0 border-b bg-linear-to-b from-background to-muted/20 px-6 py-5">
          <DialogHeader className="space-y-2 text-right sm:text-right">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <ReceiptText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle>تفاصيل حركة الصندوق</DialogTitle>
                <DialogDescription className="mt-1">بيانات الحركة وأثرها المالي ومرجعها المرتبط.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              جار تحميل تفاصيل الحركة...
            </div>
          ) : error || !transaction ? (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              تعذر تحميل تفاصيل الحركة.
            </div>
          ) : (
            <div className="space-y-4">
              <DetailsSection icon={FileText} title="معلومات الحركة">
                <Detail label="رقم الحركة" value={transaction.transaction_number || `#${transaction.id}`} ltr />
                <Detail label="الاتجاه" value={<CashboxDirectionBadge direction={transaction.direction} />} />
                <Detail
                  label="تصنيف الحركة"
                  value={CASHBOX_TRANSACTION_TYPE_LABELS_AR[transaction.transaction_type as CashboxTransactionType] ?? transaction.transaction_type}
                />
                <Detail label="طريقة الدفع" value={transaction.payment_method ? CASHBOX_PAYMENT_METHOD_LABELS_AR[transaction.payment_method] : "—"} />
                <Detail label="تاريخ الحركة" value={formatCashboxDate(transaction.transaction_date, true)} />
                <Detail label="حركة يدوية" value={<Badge variant={transaction.is_manual ? "default" : "secondary"}>{transaction.is_manual ? "نعم" : "لا"}</Badge>} />
              </DetailsSection>

              <DetailsSection icon={CircleDollarSign} title="الأثر المالي">
                <Detail label="المبلغ" value={formatCashboxMoney(transaction.amount)} ltr />
                <Detail label="الرصيد قبل الحركة" value={transaction.before_balance == null ? "غير متاح" : formatCashboxMoney(transaction.before_balance)} ltr={transaction.before_balance != null} />
                <Detail label="الرصيد بعد الحركة" value={transaction.after_balance == null ? "غير متاح" : formatCashboxMoney(transaction.after_balance)} ltr={transaction.after_balance != null} />
              </DetailsSection>

              <DetailsSection icon={ReceiptText} title="المصدر والمرجع">
                <Detail label="نوع المصدر" value={sourceLabel} />
                <Detail label="رقم المرجع" value={reference} ltr />
                <Detail label="معرّف المصدر" value={transaction.source_id == null ? "—" : String(transaction.source_id)} ltr />
                <Detail label="السبب / البيان" value={transaction.description || "—"} wide />
              </DetailsSection>

              <DetailsSection icon={UserRound} title="التسجيل والتدقيق">
                <Detail label="المستخدم" value={transaction.created_by?.name || "—"} />
                <Detail label="تاريخ التسجيل" value={formatCashboxDate(transaction.created_at, true)} />
                <Detail label="تاريخ آخر تحديث" value={transaction.updated_at ? formatCashboxDate(transaction.updated_at, true) : "—"} />
                {transaction.cancelled_at ? <Detail label="تاريخ الإلغاء" value={formatCashboxDate(transaction.cancelled_at, true)} /> : null}
                {transaction.cancel_reason ? <Detail label="سبب الإلغاء" value={transaction.cancel_reason} wide /> : null}
              </DetailsSection>

              <DetailsSection icon={CalendarClock} title="الملاحظات">
                <p className="col-span-full whitespace-pre-wrap text-sm leading-7">{transaction.notes || "لا توجد ملاحظات"}</p>
              </DetailsSection>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 flex-row-reverse justify-start border-t bg-muted/20 px-6 py-4 sm:justify-start">
          <DialogClose asChild><Button variant="outline">إغلاق</Button></DialogClose>
          {sourceHref ? <Button asChild className="gap-2"><Link href={sourceHref}><ArrowUpLeft className="size-4" />عرض المرجع</Link></Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DetailsSection({ icon: Icon, title, children }: { icon: typeof FileText; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
        {title}
      </h3>
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Detail({ label, value, ltr = false, wide = false }: { label: string; value: ReactNode; ltr?: boolean; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium" dir={ltr ? "ltr" : undefined}>{value}</div>
    </div>
  )
}
