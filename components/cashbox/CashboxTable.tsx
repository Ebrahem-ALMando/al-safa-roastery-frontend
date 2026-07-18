"use client"

import Link from "next/link"
import { MoreHorizontal, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CASHBOX_MESSAGES,
  CASHBOX_PAYMENT_METHOD_LABELS_AR,
  CASHBOX_SOURCE_TYPE_LABELS_AR,
  CASHBOX_TABLE_COLUMNS,
  CASHBOX_TRANSACTION_TYPE_LABELS_AR,
  cashboxSourceDetailsHref,
  formatCashboxDate,
  formatCashboxMoney,
  type CashboxPaginationMeta,
  type CashboxTableColumnId,
  type CashboxTransaction,
  type CashboxTransactionType,
} from "@/src/features/cashbox"
import { CashboxDirectionBadge } from "./CashboxDirectionBadge"
import { CashboxRowActionsMenuContent, CashboxRowContextMenuContent } from "./cashbox-row-actions-menu"

type Props = {
  transactions: CashboxTransaction[]
  meta?: CashboxPaginationMeta
  visibleColumns: CashboxTableColumnId[]
  isLoading: boolean
  page: number
  onPageChange: (page: number) => void
  onDetails: (transaction: CashboxTransaction) => void
}

export function CashboxTable({ transactions, meta, visibleColumns, isLoading, page, onPageChange, onDetails }: Props) {
  const perPage = meta?.per_page ?? 15
  const lastPage = meta?.last_page ?? 1

  function cell(column: CashboxTableColumnId, transaction: CashboxTransaction, index: number) {
    const note = [transaction.description, transaction.notes].filter(Boolean).join(" · ")
    switch (column) {
      case "row_number": return (page - 1) * perPage + index + 1
      case "transaction_date": return <span className="whitespace-nowrap text-xs">{formatCashboxDate(transaction.transaction_date, true)}</span>
      case "transaction_number": return <TransactionReference transaction={transaction} />
      case "type": return <CashboxDirectionBadge direction={transaction.direction} />
      case "source": return <SourceReference transaction={transaction} />
      case "payment_method": return transaction.payment_method ? CASHBOX_PAYMENT_METHOD_LABELS_AR[transaction.payment_method] : "—"
      case "incoming": return transaction.direction === "in" ? <span className="font-semibold text-emerald-700" dir="ltr">{formatCashboxMoney(transaction.amount)}</span> : <span>—</span>
      case "outgoing": return transaction.direction === "out" ? <span className="font-semibold text-rose-700" dir="ltr">{formatCashboxMoney(transaction.amount)}</span> : <span>—</span>
      case "balance_after": return transaction.after_balance == null ? <span className="text-muted-foreground">غير متاح</span> : <span className="font-semibold" dir="ltr">{formatCashboxMoney(transaction.after_balance)}</span>
      case "user": return transaction.created_by?.name || "—"
      case "notes": return <p className="max-w-64 line-clamp-2 text-right" title={note || undefined}>{note || "—"}</p>
      case "transaction_type": return CASHBOX_TRANSACTION_TYPE_LABELS_AR[transaction.transaction_type as CashboxTransactionType] ?? transaction.transaction_type
      case "source_type": return transaction.source_type ? CASHBOX_SOURCE_TYPE_LABELS_AR[transaction.source_type] ?? transaction.source_type : "—"
      case "source_number": return transaction.source_number || "—"
      case "description": return <p className="max-w-64 line-clamp-2 text-right" title={transaction.description || undefined}>{transaction.description || "—"}</p>
      case "created_at": return <span className="whitespace-nowrap text-xs">{formatCashboxDate(transaction.created_at, true)}</span>
      case "actions": return <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label="إجراءات الحركة"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><CashboxRowActionsMenuContent onDetails={() => onDetails(transaction)} /></DropdownMenu>
    }
  }

  return <div>
    {isLoading ? <Table dir="rtl"><TableHeader><TableRow>{visibleColumns.map((id) => <TableHead key={id} className="text-center">{columnLabel(id)}</TableHead>)}</TableRow></TableHeader><TableBody>{Array.from({ length: 6 }).map((_, row) => <TableRow key={row}>{visibleColumns.map((id) => <TableCell key={id}><Skeleton className="mx-auto h-5 w-20" /></TableCell>)}</TableRow>)}</TableBody></Table>
      : transactions.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground"><WalletCards className="size-10" /><p>{CASHBOX_MESSAGES.empty}</p></div>
        : <Table dir="rtl"><TableHeader><TableRow>{visibleColumns.map((id) => <TableHead key={id} className="whitespace-nowrap text-center font-semibold">{columnLabel(id)}</TableHead>)}</TableRow></TableHeader><TableBody>{transactions.map((transaction, index) => <ContextMenu key={transaction.id}><ContextMenuTrigger asChild><TableRow>{visibleColumns.map((column) => <TableCell key={column} className="text-center text-sm">{cell(column, transaction, index)}</TableCell>)}</TableRow></ContextMenuTrigger><CashboxRowContextMenuContent onDetails={() => onDetails(transaction)} /></ContextMenu>)}</TableBody></Table>}
    {!isLoading && transactions.length > 0 && lastPage > 1 ? <div className="flex items-center justify-between border-t p-3"><p className="text-sm text-muted-foreground">{meta?.total ?? transactions.length} حركة · صفحة {page} من {lastPage}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>السابق</Button><Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>التالي</Button></div></div> : null}
  </div>
}

function columnLabel(id: CashboxTableColumnId) {
  return CASHBOX_TABLE_COLUMNS.find((column) => column.id === id)?.label
}

function TransactionReference({ transaction }: { transaction: CashboxTransaction }) {
  return <div className="min-w-28 text-center"><p className="font-mono text-xs" dir="ltr">{transaction.transaction_number || `#${transaction.id}`}</p>{transaction.source_number ? <p className="mt-1 font-mono text-[11px] text-muted-foreground" dir="ltr">{transaction.source_number}</p> : null}</div>
}

function SourceReference({ transaction }: { transaction: CashboxTransaction }) {
  const label = transaction.source_type ? CASHBOX_SOURCE_TYPE_LABELS_AR[transaction.source_type] ?? transaction.source_type : "أخرى"
  const reference = transaction.source_number || (transaction.source_id ? `#${transaction.source_id}` : null)
  const href = cashboxSourceDetailsHref(transaction.source_type, transaction.source_id)
  return <div className="min-w-28 text-center"><p className="text-sm font-medium">{label}</p>{reference ? href ? <Button variant="link" size="sm" asChild className="h-auto p-0 font-mono text-xs"><Link href={href} dir="ltr">{reference}</Link></Button> : <p className="font-mono text-xs text-muted-foreground" dir="ltr">{reference}</p> : null}</div>
}
