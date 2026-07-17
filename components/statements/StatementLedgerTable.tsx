"use client"

import Link from "next/link"
import { BookOpenText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  STATEMENT_MESSAGES,
  formatStatementDate,
  formatStatementMoney,
  formatStatementBalanceMoney,
  STATEMENT_MOVEMENT_COLUMNS,
  statementBalanceMeaning,
  statementReferenceHref,
  type StatementEntityType,
  type StatementEntry,
  type StatementMovementColumnId,
} from "@/src/features/statements"
import { StatementEntryTypeBadge } from "./StatementEntryTypeBadge"

export function StatementLedgerTable({ entityType, entries, visibleColumns, isLoading, hasSelection }: { entityType: StatementEntityType; entries: StatementEntry[]; visibleColumns: StatementMovementColumnId[]; isLoading: boolean; hasSelection: boolean }) {
  const columns = STATEMENT_MOVEMENT_COLUMNS.filter((column) => visibleColumns.includes(column.id))
  if (isLoading) return <Table dir="rtl"><TableHeader><HeaderRow columns={columns} /></TableHeader><TableBody>{Array.from({ length: 7 }).map((_, row) => <TableRow key={row}>{columns.map((column) => <TableCell key={column.id}><Skeleton className="mx-auto h-5 w-20" /></TableCell>)}</TableRow>)}</TableBody></Table>

  if (!hasSelection || entries.length === 0) return <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground" dir="rtl"><BookOpenText className="size-10" /><p>{hasSelection ? STATEMENT_MESSAGES.emptyPeriod : STATEMENT_MESSAGES.selectEntity}</p></div>

  return <Table dir="rtl"><TableHeader><HeaderRow columns={columns} /></TableHeader><TableBody>{entries.map((entry, index) => {
    const href = statementReferenceHref(entry)
    const reference = entry.reference_number || (entry.reference_id ? `#${entry.reference_id}` : "—")
    const description = entry.notes || statementDescription(entry)
    return <TableRow key={`${entry.entry_type}-${entry.reference_id ?? "opening"}-${entry.entry_date}-${index}`}>{columns.map((column) => {
      switch (column.id) {
        case "entry_date": return <TableCell key={column.id} className="whitespace-nowrap text-right text-xs">{formatStatementDate(entry.entry_date)}</TableCell>
        case "entry_type": return <TableCell key={column.id} className="text-right"><StatementEntryTypeBadge entry={entry} /></TableCell>
        case "reference": return <TableCell key={column.id} className="text-right">{href ? <Button variant="link" size="sm" asChild className="h-auto p-0 font-mono text-xs"><Link href={href} dir="ltr">{reference}</Link></Button> : <span className="inline-block font-mono text-xs" dir="ltr">{reference}</span>}</TableCell>
        case "description": return <TableCell key={column.id}><p className="max-w-72 line-clamp-2 text-right text-sm" title={description}>{description}</p></TableCell>
        case "debit": return <TableCell key={column.id} className="text-center font-semibold text-amber-700" dir="ltr">{Number(entry.increase) === 0 ? "—" : formatStatementMoney(entry.increase)}</TableCell>
        case "credit": return <TableCell key={column.id} className="text-center font-semibold text-emerald-700" dir="ltr">{Number(entry.decrease) === 0 ? "—" : formatStatementMoney(entry.decrease)}</TableCell>
        case "running_balance": return <TableCell key={column.id} className="text-center"><p className="font-bold" dir="ltr">{formatStatementBalanceMoney(entry.balance_after)}</p><p className="mt-1 text-[11px] text-muted-foreground">{statementBalanceMeaning(entityType, entry.balance_after)}</p></TableCell>
        case "user": return <TableCell key={column.id} className="text-right text-sm">{entry.created_by?.name || "—"}</TableCell>
      }
    })}</TableRow>
  })}</TableBody></Table>
}

function HeaderRow({ columns }: { columns: typeof STATEMENT_MOVEMENT_COLUMNS }) {
  return <TableRow>{columns.map((column) => <TableHead key={column.id} className={["debit", "credit", "running_balance"].includes(column.id) ? "text-center" : "text-right"}>{column.label}</TableHead>)}</TableRow>
}

function statementDescription(entry: StatementEntry): string {
  if (entry.entry_type === "opening_balance" || entry.entry_type.endsWith("_opening_balance")) return "الرصيد المعتمد في بداية الفترة"
  if (Number(entry.remaining_or_balance_impact) !== 0) return `أثر الحركة على الرصيد: ${formatStatementMoney(entry.remaining_or_balance_impact)}`
  return "حركة مالية مسجلة"
}
