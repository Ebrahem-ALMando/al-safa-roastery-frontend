"use client"

import Link from "next/link"
import { Printer, RefreshCw, Scale } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { ItemsPeriodControls } from "@/components/items/ItemsPeriodControls"
import { DateRangeDialog } from "@/components/shared/DateRangeDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  STATEMENT_MESSAGES,
  defaultStatementPeriod,
  formatStatementMoney,
  statementBalanceMeaning,
  statementPrintHref,
  useStatementPage,
  type StatementEntityOption,
  type StatementEntityType,
} from "@/src/features/statements"
import { StatementEntitySelector } from "./StatementEntitySelector"
import { StatementEntityTypeToggle } from "./StatementEntityTypeToggle"
import { StatementLedgerTable } from "./StatementLedgerTable"
import { StatementSummary } from "./StatementSummary"

export function StatementsView({ initialEntityType, initialEntityId }: { initialEntityType?: StatementEntityType; initialEntityId?: number | null }) {
  const page = useStatementPage({ entityType: initialEntityType, entityId: initialEntityId })
  const dialogDefault = defaultStatementPeriod()
  const party = page.statement?.party
  const selectorValue: StatementEntityOption | null = party ? {
    id: party.id,
    name: party.name,
    code: party.code,
    phone: party.phone,
  } : page.selectedEntity
  const printHref = page.selectedEntity ? statementPrintHref(page.entityType, page.selectedEntity.id, page.filters) : null

  return <div className="space-y-6" dir="rtl" lang="ar">
    <DashboardPageHeader>
      <DashboardPageHeader.Lead><h1 className="flex items-center gap-2 text-md font-bold">كشوف الحساب / <span className="font-normal text-muted-foreground">سجل أرصدة الزبائن والموردين</span></h1></DashboardPageHeader.Lead>
      <DashboardPageHeader.Actions>
        <ItemsPeriodControls preset={page.periodPreset} onPresetChange={page.setPeriodPreset} />
        {printHref ? <Button variant="outline" asChild className="gap-2 rounded-xl"><Link href={printHref} target="_blank"><Printer className="size-4" />طباعة الكشف</Link></Button> : <Button variant="outline" disabled className="gap-2 rounded-xl"><Printer className="size-4" />طباعة الكشف</Button>}
      </DashboardPageHeader.Actions>
    </DashboardPageHeader>

    <section className="grid gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2"><p className="text-sm font-semibold">نوع الكشف</p><StatementEntityTypeToggle value={page.entityType} onChange={page.setEntityType} /></div>
      <div className="space-y-2"><p className="text-sm font-semibold">اختيار {page.entityType === "customer" ? "الزبون" : "المورد"}</p><StatementEntitySelector type={page.entityType} value={selectorValue} onChange={page.setSelectedEntity} /></div>
    </section>

    {party ? <section className="flex flex-col gap-4 rounded-2xl border bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-5 sm:flex-row sm:items-center"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-card text-primary"><Scale className="size-6" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{party.name}</h2><Badge variant="outline">{party.type === "customer" ? "زبون" : "مورد"}</Badge></div><p className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">{party.code || `#${party.id}`}{party.phone ? ` · ${party.phone}` : ""}</p></div><div className="text-left"><p className="text-xs text-muted-foreground">الرصيد الحالي المسجل</p><p className="mt-1 text-xl font-bold" dir="ltr">{formatStatementMoney(party.current_balance)}</p><p className="text-xs text-muted-foreground">{statementBalanceMeaning(party.type, party.current_balance)}</p></div></section> : null}

    {page.selectedEntity ? <StatementSummary summary={page.statement?.summary} isLoading={page.isLoading} /> : null}

    {page.error && !page.isLoading ? <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6"><p className="text-sm text-destructive">{STATEMENT_MESSAGES.loadingError}</p><Button variant="outline" onClick={() => void page.mutate()} className="gap-2"><RefreshCw className="size-4" />إعادة المحاولة</Button></div>
      : <div className="overflow-hidden rounded-xl border shadow-sm"><StatementLedgerTable entityType={page.entityType} entries={page.statement?.entries ?? []} isLoading={Boolean(page.selectedEntity) && page.isLoading} hasSelection={Boolean(page.selectedEntity)} /></div>}

    <DateRangeDialog open={page.customDialogOpen} onOpenChange={page.setCustomDialogOpen} from={page.customPeriod?.from ?? dialogDefault.from} to={page.customPeriod?.to ?? dialogDefault.to} onApply={page.applyCustomPeriod} />
  </div>
}
