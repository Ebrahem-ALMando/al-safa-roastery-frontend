"use client"

import { Loader2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  STATEMENT_MESSAGES,
  formatStatementDate,
  formatStatementMoney,
  statementEntryLabel,
  useStatement,
  type StatementEntityType,
  type StatementQuery,
  type StatementResponse,
} from "@/src/features/statements"

export function StatementPrintView({ entityType, entityId, filters }: { entityType: StatementEntityType; entityId: number; filters: StatementQuery }) {
  const { statement, isLoading, error } = useStatement(entityType, entityId, filters)

  if (isLoading) return <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-muted-foreground"><Loader2 className="size-10 animate-spin" /><p>جاري تحميل كشف الحساب...</p></div>
  if (error || !statement) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-white p-6 text-destructive">{STATEMENT_MESSAGES.loadingError}</div>

  return <StatementPrintDocument statement={statement} />
}

function StatementPrintDocument({ statement }: { statement: StatementResponse }) {
  const printedAt = new Intl.DateTimeFormat("ar-SY", { dateStyle: "medium", timeStyle: "short" }).format(new Date())
  const periodLabel = statement.period.date_from || statement.period.date_to
    ? `${statement.period.date_from ? formatStatementDate(statement.period.date_from) : "البداية"} — ${statement.period.date_to ? formatStatementDate(statement.period.date_to) : "اليوم"}`
    : "كامل السجل"

  return <div dir="rtl" lang="ar" className="min-h-screen bg-white text-black print:min-h-0">
    <div className="sticky top-0 z-10 border-b bg-white/95 p-4 backdrop-blur print:hidden"><div className="mx-auto flex max-w-[210mm] justify-end"><Button type="button" onClick={() => window.print()} className="gap-2 rounded-xl"><Printer className="size-4" />طباعة</Button></div></div>
    <main className="mx-auto max-w-[210mm] bg-white p-8 print:p-6">
      <header className="border-b-2 border-black pb-4"><div className="flex items-start justify-between gap-6"><div><h1 className="text-2xl font-bold">كشف حساب {statement.party.type === "customer" ? "زبون" : "مورد"}</h1><p className="mt-1 text-sm text-neutral-600">محمصة الصفا</p></div><div className="text-left"><p className="font-bold">{statement.party.name}</p><p className="font-mono text-sm" dir="ltr">{statement.party.code || `#${statement.party.id}`}</p>{statement.party.phone ? <p className="text-sm" dir="ltr">{statement.party.phone}</p> : null}</div></div><p className="mt-4 text-sm">الفترة: {periodLabel}</p></header>

      <section className="mt-6 grid grid-cols-4 gap-3 text-sm">{[
        ["الرصيد الافتتاحي", statement.summary.opening_balance],
        ["إجمالي المدين", statement.summary.total_increase],
        ["إجمالي الدائن", statement.summary.total_decrease],
        ["الرصيد الختامي", statement.summary.closing_balance],
      ].map(([label, value]) => <div key={String(label)} className="border p-3 text-center"><p className="text-xs text-neutral-600">{label}</p><p className="mt-1 font-bold" dir="ltr">{formatStatementMoney(value)}</p></div>)}</section>

      <table className="mt-7 w-full border-collapse text-xs"><thead><tr className="border-b-2 border-black"><th className="py-2 text-right">التاريخ</th><th className="py-2 text-right">الحركة</th><th className="py-2 text-right">المرجع</th><th className="py-2 text-right">البيان</th><th className="py-2 text-center">مدين</th><th className="py-2 text-center">دائن</th><th className="py-2 text-center">الرصيد</th></tr></thead><tbody>{statement.entries.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-neutral-500">{STATEMENT_MESSAGES.emptyPeriod}</td></tr> : statement.entries.map((entry, index) => <tr key={`${entry.entry_type}-${entry.reference_id}-${index}`} className="border-b border-neutral-300"><td className="py-2">{formatStatementDate(entry.entry_date)}</td><td className="py-2">{statementEntryLabel(entry)}</td><td className="py-2 font-mono" dir="ltr">{entry.reference_number || "—"}</td><td className="max-w-48 py-2">{entry.notes || entry.entry_label}</td><td className="py-2 text-center" dir="ltr">{Number(entry.increase) === 0 ? "—" : formatStatementMoney(entry.increase)}</td><td className="py-2 text-center" dir="ltr">{Number(entry.decrease) === 0 ? "—" : formatStatementMoney(entry.decrease)}</td><td className="py-2 text-center font-bold" dir="ltr">{formatStatementMoney(entry.balance_after)}</td></tr>)}</tbody></table>

      <footer className="mt-10 border-t pt-4 text-center text-xs text-neutral-500">تاريخ الطباعة: {printedAt}</footer>
    </main>
  </div>
}
