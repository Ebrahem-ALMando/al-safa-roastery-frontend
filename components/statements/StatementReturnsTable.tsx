"use client"

import Link from "next/link"
import { RotateCcw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatStatementDate, formatStatementDateTime, formatStatementMoney, STATEMENT_RETURN_COLUMNS, type StatementEntityType, type StatementPaginationMeta, type StatementReturn, type StatementReturnColumnId } from "@/src/features/statements"
import { StatementPagination } from "./StatementPagination"
import { StatementStatusBadge } from "./StatementStatusBadge"

export function StatementReturnsTable({ entityType, items, meta, columns: visible, isLoading, page, onPageChange }: { entityType: StatementEntityType; items: StatementReturn[]; meta?: StatementPaginationMeta; columns: StatementReturnColumnId[]; isLoading: boolean; page: number; onPageChange: (page: number) => void }) {
  const columns = STATEMENT_RETURN_COLUMNS.filter((column) => visible.includes(column.id))
  if (!isLoading && items.length === 0) return <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border text-center text-muted-foreground" dir="rtl"><RotateCcw className="size-10" /><p>لا توجد مرتجعات ضمن الفترة والفلاتر المحددة.</p></div>
  return <div className="overflow-hidden rounded-xl border"><Table dir="rtl"><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.id} className={column.id === "amount" ? "text-center" : "text-right"}>{column.label}</TableHead>)}</TableRow></TableHeader><TableBody>{isLoading ? <>{Array.from({ length: 6 }).map((_, row) => <TableRow key={row}>{columns.map((column) => <TableCell key={column.id}><Skeleton className="h-5 w-20" /></TableCell>)}</TableRow>)}</> : items.map((item) => <TableRow key={item.id}>{columns.map((column) => <ReturnCell key={column.id} column={column.id} item={item} entityType={entityType} />)}</TableRow>)}</TableBody></Table><StatementPagination meta={meta} page={page} onPageChange={onPageChange} noun="مرتجع" /></div>
}

function ReturnCell({ column, item, entityType }: { column: StatementReturnColumnId; item: StatementReturn; entityType: StatementEntityType }) {
  switch (column) {
    case "return_number": return <TableCell className="text-right"><span className="inline-block font-mono text-xs font-semibold" dir="ltr">{item.return_number}</span></TableCell>
    case "return_date": return <TableCell className="text-right">{formatStatementDate(item.return_date)}</TableCell>
    case "amount": return <TableCell className="text-center font-semibold" dir="ltr">{formatStatementMoney(item.total)}</TableCell>
    case "status": return <TableCell className="text-right"><StatementStatusBadge status={item.status} /></TableCell>
    case "reference": return <TableCell className="text-right">{item.reference ? entityType === "supplier" && item.reference.id ? <Link href={`/dashboard/purchases/${item.reference.id}`} className="font-mono text-xs text-primary hover:underline" dir="ltr">{item.reference.number || `#${item.reference.id}`}</Link> : <span className="font-mono text-xs" dir="ltr">{item.reference.number || "—"}</span> : "—"}</TableCell>
    case "reason": return <TableCell className="max-w-64 truncate text-right" title={(item.cancel_reason || item.notes) ?? undefined}>{item.cancel_reason || item.notes || "—"}</TableCell>
    case "user": return <TableCell className="text-right">{item.created_by?.name || "—"}</TableCell>
    case "notes": return <TableCell className="max-w-64 truncate text-right" title={item.notes ?? undefined}>{item.notes || "—"}</TableCell>
    case "created_at": case "updated_at": return <TableCell className="text-right">{formatStatementDateTime(item[column])}</TableCell>
  }
}
