"use client"

import Link from "next/link"
import { Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatStatementDate, formatStatementDateTime, formatStatementMoney, STATEMENT_INVOICE_COLUMNS, type StatementEntityType, type StatementInvoice, type StatementInvoiceColumnId, type StatementPaginationMeta } from "@/src/features/statements"
import { StatementPagination } from "./StatementPagination"
import { StatementStatusBadge } from "./StatementStatusBadge"

export function StatementInvoicesTable({ entityType, items, meta, columns: visible, isLoading, page, onPageChange }: { entityType: StatementEntityType; items: StatementInvoice[]; meta?: StatementPaginationMeta; columns: StatementInvoiceColumnId[]; isLoading: boolean; page: number; onPageChange: (page: number) => void }) {
  const columns = STATEMENT_INVOICE_COLUMNS.filter((column) => visible.includes(column.id))
  if (!isLoading && items.length === 0) return <Empty icon={FileText} text="لا توجد فواتير ضمن الفترة والفلاتر المحددة." />
  return <div className="overflow-hidden rounded-xl border"><Table dir="rtl"><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.id} className={moneyColumns.includes(column.id) ? "text-center" : "text-right"}>{column.label}</TableHead>)}</TableRow></TableHeader><TableBody>{isLoading ? <SkeletonRows columns={columns.length} /> : items.map((invoice) => <TableRow key={invoice.id}>{columns.map((column) => <InvoiceCell key={column.id} column={column.id} invoice={invoice} entityType={entityType} />)}</TableRow>)}</TableBody></Table><StatementPagination meta={meta} page={page} onPageChange={onPageChange} noun="فاتورة" /></div>
}

const moneyColumns: StatementInvoiceColumnId[] = ["total", "paid_amount", "remaining_amount", "subtotal", "discount"]

function InvoiceCell({ column, invoice, entityType }: { column: StatementInvoiceColumnId; invoice: StatementInvoice; entityType: StatementEntityType }) {
  switch (column) {
    case "invoice_number": return <TableCell className="text-right"><span className="inline-block font-mono text-xs font-semibold" dir="ltr">{invoice.invoice_number}</span></TableCell>
    case "invoice_date": return <TableCell className="text-right">{formatStatementDate(invoice.invoice_date)}</TableCell>
    case "total": case "paid_amount": case "remaining_amount": case "subtotal": case "discount": return <TableCell className="text-center font-semibold" dir="ltr">{formatStatementMoney(invoice[column])}</TableCell>
    case "payment_status": return <TableCell className="text-right"><StatementStatusBadge status={invoice.payment_status} /></TableCell>
    case "status": return <TableCell className="text-right"><StatementStatusBadge status={invoice.status} /></TableCell>
    case "actions": return <TableCell className="text-right">{entityType === "supplier" ? <Button variant="ghost" size="sm" asChild className="gap-1"><Link href={`/dashboard/purchases/${invoice.id}`}><Eye className="size-4" />عرض التفاصيل</Link></Button> : <span className="text-muted-foreground">—</span>}</TableCell>
    case "notes": return <TableCell className="max-w-64 truncate text-right" title={invoice.notes ?? undefined}>{invoice.notes || "—"}</TableCell>
    case "created_at": case "completed_at": case "cancelled_at": return <TableCell className="text-right">{formatStatementDateTime(invoice[column])}</TableCell>
    case "created_by": return <TableCell className="text-right">{invoice.created_by?.name || "—"}</TableCell>
  }
}

function SkeletonRows({ columns }: { columns: number }) { return <>{Array.from({ length: 6 }).map((_, row) => <TableRow key={row}>{Array.from({ length: columns }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-5 w-20" /></TableCell>)}</TableRow>)}</> }
function Empty({ icon: Icon, text }: { icon: typeof FileText; text: string }) { return <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border text-center text-muted-foreground" dir="rtl"><Icon className="size-10" /><p>{text}</p></div> }
