"use client"

import Link from "next/link"
import { CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatStatementDate, formatStatementDateTime, formatStatementMoney, STATEMENT_PAYMENT_COLUMNS, STATEMENT_PAYMENT_METHOD_LABELS_AR, type StatementEntityType, type StatementPaginationMeta, type StatementPayment, type StatementPaymentColumnId } from "@/src/features/statements"
import { StatementPagination } from "./StatementPagination"
import { StatementStatusBadge } from "./StatementStatusBadge"

export function StatementPaymentsTable({ entityType, items, meta, columns: visible, isLoading, page, onPageChange }: { entityType: StatementEntityType; items: StatementPayment[]; meta?: StatementPaginationMeta; columns: StatementPaymentColumnId[]; isLoading: boolean; page: number; onPageChange: (page: number) => void }) {
  const columns = STATEMENT_PAYMENT_COLUMNS.filter((column) => visible.includes(column.id))
  if (!isLoading && items.length === 0) return <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border text-center text-muted-foreground" dir="rtl"><CreditCard className="size-10" /><p>لا توجد دفعات ضمن الفترة والفلاتر المحددة.</p></div>
  return <div className="overflow-hidden rounded-xl border"><Table dir="rtl"><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.id} className={moneyColumns.includes(column.id) ? "text-center" : "text-right"}>{column.label}</TableHead>)}</TableRow></TableHeader><TableBody>{isLoading ? <>{Array.from({ length: 6 }).map((_, row) => <TableRow key={row}>{columns.map((column) => <TableCell key={column.id}><Skeleton className="h-5 w-20" /></TableCell>)}</TableRow>)}</> : items.map((payment) => <TableRow key={payment.id}>{columns.map((column) => <PaymentCell key={column.id} column={column.id} payment={payment} entityType={entityType} />)}</TableRow>)}</TableBody></Table><StatementPagination meta={meta} page={page} onPageChange={onPageChange} noun="دفعة" /></div>
}

const moneyColumns: StatementPaymentColumnId[] = ["amount", "allocated_amount", "unallocated_amount"]
function PaymentCell({ column, payment, entityType }: { column: StatementPaymentColumnId; payment: StatementPayment; entityType: StatementEntityType }) {
  switch (column) {
    case "payment_number": return <TableCell className="text-right"><span className="inline-block font-mono text-xs font-semibold" dir="ltr">{payment.payment_number}</span></TableCell>
    case "payment_date": return <TableCell className="text-right">{formatStatementDate(payment.payment_date)}</TableCell>
    case "amount": case "allocated_amount": case "unallocated_amount": return <TableCell className="text-center font-semibold" dir="ltr">{formatStatementMoney(payment[column])}</TableCell>
    case "payment_method": return <TableCell className="text-right">{STATEMENT_PAYMENT_METHOD_LABELS_AR[payment.payment_method] ?? payment.payment_method}</TableCell>
    case "reference": return <TableCell className="text-right">{payment.references.length ? <div className="flex flex-wrap gap-1">{payment.references.map((reference) => entityType === "supplier" && reference.id ? <Link key={reference.id} href={`/dashboard/purchases/${reference.id}`} className="font-mono text-xs text-primary hover:underline" dir="ltr">{reference.number || `#${reference.id}`}</Link> : <span key={reference.id ?? reference.number} className="font-mono text-xs" dir="ltr">{reference.number || "—"}</span>)}</div> : "—"}</TableCell>
    case "notes": return <TableCell className="max-w-64 truncate text-right" title={payment.notes ?? undefined}>{payment.notes || "—"}</TableCell>
    case "user": return <TableCell className="text-right">{payment.created_by?.name || "—"}</TableCell>
    case "status": return <TableCell className="text-right"><StatementStatusBadge status={payment.status} /></TableCell>
    case "created_at": case "updated_at": return <TableCell className="text-right">{formatStatementDateTime(payment[column])}</TableCell>
  }
}
