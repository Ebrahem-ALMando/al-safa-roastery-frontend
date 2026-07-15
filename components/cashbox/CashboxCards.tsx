"use client"

import { WalletCards } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CASHBOX_MESSAGES,
  CASHBOX_PAYMENT_METHOD_LABELS_AR,
  CASHBOX_SOURCE_TYPE_LABELS_AR,
  CASHBOX_TRANSACTION_TYPE_LABELS_AR,
  formatCashboxDate,
  formatCashboxMoney,
  type CashboxPaginationMeta,
  type CashboxTransaction,
  type CashboxTransactionType,
} from "@/src/features/cashbox"
import { CashboxDirectionBadge } from "./CashboxDirectionBadge"

export function CashboxCards({ transactions, meta, isLoading, page, onPageChange }: { transactions: CashboxTransaction[]; meta?: CashboxPaginationMeta; isLoading: boolean; page: number; onPageChange: (page: number) => void }) {
  if (isLoading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-80 rounded-2xl" />)}</div>
  if (transactions.length === 0) return <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground"><WalletCards className="size-10" />{CASHBOX_MESSAGES.empty}</div>
  const lastPage = meta?.last_page ?? 1
  return <div className="space-y-4"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{transactions.map((transaction) => {
    const sourceLabel = transaction.source_type ? CASHBOX_SOURCE_TYPE_LABELS_AR[transaction.source_type] ?? transaction.source_type : "أخرى"
    const note = [transaction.description, transaction.notes].filter(Boolean).join(" · ")
    return <Card key={transaction.id} className="overflow-hidden rounded-2xl transition hover:border-primary/30 hover:shadow-md"><CardHeader className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><CashboxDirectionBadge direction={transaction.direction} /><Badge variant="secondary">{sourceLabel}</Badge></div><div><h3 className="font-mono font-bold" dir="ltr">{transaction.transaction_number || `#${transaction.id}`}</h3><p className="text-xs text-muted-foreground">{CASHBOX_TRANSACTION_TYPE_LABELS_AR[transaction.transaction_type as CashboxTransactionType] ?? transaction.transaction_type}</p></div></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm"><Info label="التاريخ" value={formatCashboxDate(transaction.transaction_date, true)} /><Info label="المرجع" value={transaction.source_number || (transaction.source_id ? `#${transaction.source_id}` : "—")} ltr /><Info label={transaction.direction === "in" ? "الوارد" : "الصادر"} value={formatCashboxMoney(transaction.amount)} ltr /><Info label="طريقة الدفع" value={transaction.payment_method ? CASHBOX_PAYMENT_METHOD_LABELS_AR[transaction.payment_method] : "—"} /><Info label="الرصيد بعد الحركة" value={transaction.after_balance == null ? "غير متاح" : formatCashboxMoney(transaction.after_balance)} ltr /><Info label="المستخدم" value={transaction.created_by?.name || "—"} /><div className="col-span-2 rounded-xl border bg-muted/15 p-3"><p className="text-xs text-muted-foreground">ملاحظات</p><p className="mt-1 line-clamp-2" title={note || undefined}>{note || "—"}</p></div></CardContent></Card>
  })}</div>{lastPage > 1 ? <div className="flex justify-center gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>السابق</Button><Button variant="outline" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>التالي</Button></div> : null}</div>
}

function Info({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return <div className="rounded-xl border bg-muted/15 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold" dir={ltr ? "ltr" : undefined}>{value}</p></div>
}
