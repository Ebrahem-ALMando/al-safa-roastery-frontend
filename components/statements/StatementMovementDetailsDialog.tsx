"use client"

import Link from "next/link"
import { ArrowUpLeft, CircleDollarSign, FileSearch, Info, NotebookText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  formatStatementBalanceMoney,
  formatStatementDate,
  formatStatementDateTime,
  formatStatementMoney,
  statementBalanceMeaning,
  statementReferenceHref,
  type StatementEntityType,
  type StatementEntry,
} from "@/src/features/statements"
import { StatementEntryTypeBadge } from "./StatementEntryTypeBadge"

export function StatementMovementDetailsDialog({ entityType, entry, open, onOpenChange }: { entityType: StatementEntityType; entry: StatementEntry | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const href = entry ? statementReferenceHref(entry) : null
  const reference = entry?.reference_number || (entry?.reference_id ? `#${entry.reference_id}` : "—")

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} className="flex max-h-[min(92vh,820px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-[760px]" dir="rtl" lang="ar">
      <div className="shrink-0 border-b bg-linear-to-b from-background to-muted/20 px-6 py-5">
        <DialogHeader className="space-y-2 text-right sm:text-right">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"><FileSearch className="size-5" /></span>
            <div className="min-w-0 flex-1"><DialogTitle>تفاصيل حركة الكشف</DialogTitle><DialogDescription className="mt-1">عرض كامل لتفاصيل الحركة وأثرها على الرصيد.</DialogDescription></div>
          </div>
        </DialogHeader>
      </div>

      {entry ? <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <DetailsSection icon={Info} title="معلومات الحركة">
          <Detail label="نوع الحركة" value={<StatementEntryTypeBadge entry={entry} />} />
          <Detail label="التاريخ" value={formatStatementDate(entry.entry_date)} />
          <Detail label="المرجع" value={<span className="font-mono text-xs" dir="ltr">{reference}</span>} />
          <Detail label="البيان" value={entry.description || "—"} wide />
          <Detail label="المستخدم" value={entry.created_by?.name || "—"} />
          <Detail label="تاريخ التسجيل" value={formatStatementDateTime(entry.created_at)} />
        </DetailsSection>

        <DetailsSection icon={CircleDollarSign} title="الأثر المالي">
          <Detail label="مدين" value={Number(entry.debit) === 0 ? "—" : formatStatementMoney(entry.debit)} ltr />
          <Detail label="دائن" value={Number(entry.credit) === 0 ? "—" : formatStatementMoney(entry.credit)} ltr />
          <Detail label="الرصيد قبل الحركة" value={entry.balance_before === null ? "غير متاح" : formatStatementBalanceMoney(entry.balance_before)} ltr={entry.balance_before !== null} />
          <Detail label="الرصيد بعد الحركة / الرصيد الجاري" value={formatStatementBalanceMoney(entry.running_balance)} ltr />
          <Detail label="معنى الرصيد" value={statementBalanceMeaning(entityType, entry.running_balance)} wide />
        </DetailsSection>

        <DetailsSection icon={FileSearch} title="معلومات المرجع">
          <Detail label="نوع المصدر" value={entry.source_label || entry.source_type || "—"} />
          <Detail label="رمز نوع المصدر" value={entry.source_type || "—"} ltr />
          <Detail label="معرّف المصدر" value={entry.source_id === null ? "—" : String(entry.source_id)} ltr />
          <Detail label="رقم المرجع" value={entry.reference_number || "—"} ltr />
          <Detail label="رقم المصدر" value={entry.source_number || "—"} ltr />
          <Detail label="وصف المصدر" value={entry.source_label || "—"} />
        </DetailsSection>

        <DetailsSection icon={NotebookText} title="الملاحظات">
          <p className="col-span-full whitespace-pre-wrap text-sm leading-7 text-foreground">{entry.notes || "لا توجد ملاحظات"}</p>
        </DetailsSection>
      </div> : null}

      <DialogFooter className="shrink-0 flex-row-reverse justify-start border-t bg-muted/20 px-6 py-4 sm:justify-start">
        <DialogClose asChild><Button variant="outline">إغلاق</Button></DialogClose>
        {href ? <Button asChild className="gap-2"><Link href={href}><ArrowUpLeft className="size-4" />عرض المرجع</Link></Button> : null}
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

function DetailsSection({ icon: Icon, title, children }: { icon: typeof Info; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border bg-card p-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-bold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>{title}</h3><div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div></section>
}

function Detail({ label, value, ltr = false, wide = false }: { label: string; value: React.ReactNode; ltr?: boolean; wide?: boolean }) {
  return <div className={wide ? "sm:col-span-2" : undefined}><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 text-sm font-medium" dir={ltr ? "ltr" : undefined}>{value}</div></div>
}
