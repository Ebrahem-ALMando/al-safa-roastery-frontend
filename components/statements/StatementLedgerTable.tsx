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
  statementBalanceMeaning,
  statementReferenceHref,
  type StatementEntityType,
  type StatementEntry,
} from "@/src/features/statements"
import { StatementEntryTypeBadge } from "./StatementEntryTypeBadge"

export function StatementLedgerTable({ entityType, entries, isLoading, hasSelection }: { entityType: StatementEntityType; entries: StatementEntry[]; isLoading: boolean; hasSelection: boolean }) {
  if (isLoading) return <Table dir="rtl"><TableHeader><HeaderRow /></TableHeader><TableBody>{Array.from({ length: 7 }).map((_, row) => <TableRow key={row}>{Array.from({ length: 8 }).map((__, cell) => <TableCell key={cell}><Skeleton className="mx-auto h-5 w-20" /></TableCell>)}</TableRow>)}</TableBody></Table>

  if (!hasSelection || entries.length === 0) return <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground"><BookOpenText className="size-10" /><p>{hasSelection ? STATEMENT_MESSAGES.emptyPeriod : STATEMENT_MESSAGES.selectEntity}</p></div>

  return <Table dir="rtl"><TableHeader><HeaderRow /></TableHeader><TableBody>{entries.map((entry, index) => {
    const href = statementReferenceHref(entry)
    const reference = entry.reference_number || (entry.reference_id ? `#${entry.reference_id}` : "—")
    const description = entry.notes || statementDescription(entry)
    return <TableRow key={`${entry.entry_type}-${entry.reference_id ?? "opening"}-${entry.entry_date}-${index}`}>
      <TableCell className="whitespace-nowrap text-center text-xs">{formatStatementDate(entry.entry_date)}</TableCell>
      <TableCell className="text-center"><StatementEntryTypeBadge entry={entry} /></TableCell>
      <TableCell className="text-center">{href ? <Button variant="link" size="sm" asChild className="h-auto p-0 font-mono text-xs"><Link href={href} dir="ltr">{reference}</Link></Button> : <span className="font-mono text-xs" dir="ltr">{reference}</span>}</TableCell>
      <TableCell><p className="max-w-72 line-clamp-2 text-right text-sm" title={description}>{description}</p></TableCell>
      <TableCell className="text-center font-semibold text-amber-700" dir="ltr">{Number(entry.increase) === 0 ? "—" : formatStatementMoney(entry.increase)}</TableCell>
      <TableCell className="text-center font-semibold text-emerald-700" dir="ltr">{Number(entry.decrease) === 0 ? "—" : formatStatementMoney(entry.decrease)}</TableCell>
      <TableCell className="text-center"><p className="font-bold" dir="ltr">{formatStatementMoney(entry.balance_after)}</p><p className="mt-1 text-[11px] text-muted-foreground">{statementBalanceMeaning(entityType, entry.balance_after)}</p></TableCell>
      <TableCell className="text-center text-sm">{entry.created_by?.name || "—"}</TableCell>
    </TableRow>
  })}</TableBody></Table>
}

function HeaderRow() {
  return <TableRow><TableHead className="text-center">التاريخ</TableHead><TableHead className="text-center">نوع الحركة</TableHead><TableHead className="text-center">المرجع</TableHead><TableHead className="text-right">البيان</TableHead><TableHead className="text-center">مدين</TableHead><TableHead className="text-center">دائن</TableHead><TableHead className="text-center">الرصيد الجاري</TableHead><TableHead className="text-center">المستخدم</TableHead></TableRow>
}

function statementDescription(entry: StatementEntry): string {
  if (entry.entry_type === "opening_balance" || entry.entry_type.endsWith("_opening_balance")) return "الرصيد المعتمد في بداية الفترة"
  if (Number(entry.remaining_or_balance_impact) !== 0) return `أثر الحركة على الرصيد: ${formatStatementMoney(entry.remaining_or_balance_impact)}`
  return "حركة مالية مسجلة"
}
