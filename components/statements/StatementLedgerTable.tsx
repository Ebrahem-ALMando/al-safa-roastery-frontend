"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpLeft, BookOpenText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  STATEMENT_MESSAGES,
  STATEMENT_MOVEMENT_COLUMNS,
  formatStatementBalanceMoney,
  formatStatementDate,
  formatStatementDateTime,
  formatStatementMoney,
  statementBalanceMeaning,
  statementReferenceHref,
  type StatementEntityType,
  type StatementEntry,
  type StatementMovementColumnId,
} from "@/src/features/statements"
import { StatementEntryTypeBadge } from "./StatementEntryTypeBadge"
import { StatementMovementDetailsDialog } from "./StatementMovementDetailsDialog"

export function StatementLedgerTable({ entityType, entries, visibleColumns, isLoading, hasSelection }: { entityType: StatementEntityType; entries: StatementEntry[]; visibleColumns: StatementMovementColumnId[]; isLoading: boolean; hasSelection: boolean }) {
  const [selectedEntry, setSelectedEntry] = useState<StatementEntry | null>(null)
  const columns = STATEMENT_MOVEMENT_COLUMNS.filter((column) => visibleColumns.includes(column.id))

  if (isLoading) return <Table dir="rtl"><TableHeader><HeaderRow columns={columns} /></TableHeader><TableBody>{Array.from({ length: 7 }).map((_, row) => <TableRow key={row}>{columns.map((column) => <TableCell key={column.id}><Skeleton className="mx-auto h-5 w-20" /></TableCell>)}</TableRow>)}</TableBody></Table>

  if (!hasSelection || entries.length === 0) return <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground" dir="rtl"><BookOpenText className="size-10" /><p>{hasSelection ? STATEMENT_MESSAGES.emptyPeriod : STATEMENT_MESSAGES.selectEntity}</p></div>

  return <>
    <Table dir="rtl"><TableHeader><HeaderRow columns={columns} /></TableHeader><TableBody>{entries.map((entry, index) => {
      const href = statementReferenceHref(entry)
      const reference = entry.reference_number || (entry.reference_id ? `#${entry.reference_id}` : "—")
      return <TableRow key={`${entry.entry_type}-${entry.reference_id ?? "opening"}-${entry.entry_date}-${index}`}>{columns.map((column) => {
        switch (column.id) {
          case "entry_date": return <TableCell key={column.id} className="whitespace-nowrap text-right text-xs">{formatStatementDate(entry.entry_date)}</TableCell>
          case "entry_type": return <TableCell key={column.id} className="text-right"><StatementEntryTypeBadge entry={entry} /></TableCell>
          case "reference": return <TableCell key={column.id} className="text-right">{href ? <Button variant="link" size="sm" asChild className="h-auto p-0 font-mono text-xs"><Link href={href} dir="ltr">{reference}</Link></Button> : <span className="inline-block font-mono text-xs" dir="ltr">{reference}</span>}</TableCell>
          case "description": return <TableCell key={column.id}><p className="max-w-72 line-clamp-2 text-right text-sm" title={entry.description}>{entry.description}</p></TableCell>
          case "debit": return <TableCell key={column.id} className="text-center font-semibold text-amber-700" dir="ltr">{Number(entry.debit) === 0 ? "—" : formatStatementMoney(entry.debit)}</TableCell>
          case "credit": return <TableCell key={column.id} className="text-center font-semibold text-emerald-700" dir="ltr">{Number(entry.credit) === 0 ? "—" : formatStatementMoney(entry.credit)}</TableCell>
          case "running_balance": return <TableCell key={column.id} className="text-center"><p className="font-bold" dir="ltr">{formatStatementBalanceMoney(entry.running_balance)}</p><p className="mt-1 text-[11px] text-muted-foreground">{statementBalanceMeaning(entityType, entry.running_balance)}</p></TableCell>
          case "user": return <TableCell key={column.id} className="text-right text-sm">{entry.created_by?.name || "—"}</TableCell>
          case "actions": return <TableCell key={column.id} className="text-right"><div className="flex flex-wrap items-center justify-start gap-1"><Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedEntry(entry)}><Eye className="size-4" />عرض تفاصيل الحركة</Button>{href ? <Button variant="ghost" size="sm" asChild className="gap-1"><Link href={href}><ArrowUpLeft className="size-4" />عرض المرجع</Link></Button> : null}</div></TableCell>
          case "source_type": return <TableCell key={column.id} className="text-right"><p>{entry.source_label || "—"}</p>{entry.source_type ? <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">{entry.source_type}</p> : null}</TableCell>
          case "source_number": return <TableCell key={column.id} className="text-right"><span className="font-mono text-xs" dir="ltr">{entry.source_number || "—"}</span></TableCell>
          case "created_at": return <TableCell key={column.id} className="whitespace-nowrap text-right text-xs">{formatStatementDateTime(entry.created_at)}</TableCell>
          case "notes": return <TableCell key={column.id}><p className="max-w-72 line-clamp-2 text-right text-sm" title={entry.notes ?? undefined}>{entry.notes || "—"}</p></TableCell>
        }
      })}</TableRow>
    })}</TableBody></Table>
    <StatementMovementDetailsDialog entityType={entityType} entry={selectedEntry} open={selectedEntry !== null} onOpenChange={(open) => { if (!open) setSelectedEntry(null) }} />
  </>
}

function HeaderRow({ columns }: { columns: typeof STATEMENT_MOVEMENT_COLUMNS }) {
  return <TableRow>{columns.map((column) => <TableHead key={column.id} className={["debit", "credit", "running_balance"].includes(column.id) ? "text-center" : "text-right"}>{column.label}</TableHead>)}</TableRow>
}
