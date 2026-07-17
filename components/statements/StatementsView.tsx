"use client"

import { Activity, BookOpenText, CreditCard, FileText, RefreshCw, RotateCcw, Scale } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard"
import { ItemsPeriodControls } from "@/components/items/ItemsPeriodControls"
import { DateRangeDialog } from "@/components/shared/DateRangeDialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  STATEMENT_INVOICE_COLUMNS,
  STATEMENT_MOVEMENT_COLUMNS,
  STATEMENT_PAYMENT_COLUMNS,
  STATEMENT_PAYMENT_METHOD_LABELS_AR,
  STATEMENT_RETURN_COLUMNS,
  STATEMENTS_CUSTOMER_INVOICES_COLUMNS_KEY,
  STATEMENTS_CUSTOMER_PAYMENTS_COLUMNS_KEY,
  STATEMENTS_CUSTOMER_RETURNS_COLUMNS_KEY,
  STATEMENTS_MOVEMENTS_COLUMNS_KEY,
  STATEMENTS_SUPPLIER_INVOICES_COLUMNS_KEY,
  STATEMENTS_SUPPLIER_PAYMENTS_COLUMNS_KEY,
  STATEMENTS_SUPPLIER_RETURNS_COLUMNS_KEY,
  defaultStatementPeriod,
  formatStatementBalanceMoney,
  statementBalanceMeaning,
  useStatementColumns,
  useStatementPage,
  useStatementTabsPage,
  type StatementEntityOption,
  type StatementEntityType,
  type StatementTab,
} from "@/src/features/statements"
import { StatementColumnCustomizer } from "./StatementColumnCustomizer"
import { StatementEntitySelector } from "./StatementEntitySelector"
import { StatementEntityTypeToggle } from "./StatementEntityTypeToggle"
import { StatementInvoiceFilters, StatementPaymentFilters, StatementReturnFilters } from "./StatementTabFilters"
import { StatementInvoicesTable } from "./StatementInvoicesTable"
import { StatementLedgerTable } from "./StatementLedgerTable"
import { StatementPartyBadge } from "./StatementPartyBadge"
import { StatementPaymentsTable } from "./StatementPaymentsTable"
import { StatementReturnsTable } from "./StatementReturnsTable"
import { StatementSummary } from "./StatementSummary"
import { StatementInvoiceSummaryCards, StatementMovementSummary, StatementPaymentSummaryCards, StatementReturnSummaryCards } from "./StatementTabSummary"

export function StatementsView({ initialEntityType, initialEntityId }: { initialEntityType?: StatementEntityType; initialEntityId?: number | null }) {
  const page = useStatementPage({ entityType: initialEntityType, entityId: initialEntityId })
  const dialogDefault = defaultStatementPeriod()
  const party = page.statement?.party
  const selectedId = page.selectedEntity?.id ?? null
  const tabs = useStatementTabsPage(page.entityType, selectedId, page.filters, page.hydrated && selectedId !== null)
  const movementColumns = useStatementColumns(STATEMENTS_MOVEMENTS_COLUMNS_KEY, STATEMENT_MOVEMENT_COLUMNS)
  const invoiceColumns = useStatementColumns(page.entityType === "customer" ? STATEMENTS_CUSTOMER_INVOICES_COLUMNS_KEY : STATEMENTS_SUPPLIER_INVOICES_COLUMNS_KEY, STATEMENT_INVOICE_COLUMNS)
  const paymentColumns = useStatementColumns(page.entityType === "customer" ? STATEMENTS_CUSTOMER_PAYMENTS_COLUMNS_KEY : STATEMENTS_SUPPLIER_PAYMENTS_COLUMNS_KEY, STATEMENT_PAYMENT_COLUMNS)
  const returnColumns = useStatementColumns(page.entityType === "customer" ? STATEMENTS_CUSTOMER_RETURNS_COLUMNS_KEY : STATEMENTS_SUPPLIER_RETURNS_COLUMNS_KEY, STATEMENT_RETURN_COLUMNS)
  const selectorValue: StatementEntityOption | null = party ? { id: party.id, name: party.name, code: party.code, phone: party.phone } : page.selectedEntity

  return <div className="space-y-6" dir="rtl" lang="ar">
    <DashboardPageHeader>
      <DashboardPageHeader.Lead><h1 className="flex items-center gap-2 text-md font-bold">كشوف الحساب / <span className="font-normal text-muted-foreground">سجل أرصدة الزبائن والموردين</span></h1></DashboardPageHeader.Lead>
      <DashboardPageHeader.Actions><ItemsPeriodControls preset={page.periodPreset} onPresetChange={page.setPeriodPreset} dir="rtl" /></DashboardPageHeader.Actions>
    </DashboardPageHeader>

    <section className="grid gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2"><p className="text-sm font-semibold">نوع الكشف</p><StatementEntityTypeToggle value={page.entityType} onChange={page.setEntityType} /></div>
      <div className="space-y-2"><p className="text-sm font-semibold">اختيار {page.entityType === "customer" ? "الزبون" : "المورد"}</p><StatementEntitySelector type={page.entityType} value={selectorValue} onChange={page.setSelectedEntity} /></div>
    </section>

    {!page.selectedEntity ? <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/10 px-4 text-center text-muted-foreground"><BookOpenText className="size-11" /><p>اختر زبوناً أو مورداً لعرض مؤشرات كشف الحساب.</p></div> : <>
      {party ? <section className="flex flex-col gap-4 rounded-2xl border bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-5 text-right sm:flex-row sm:items-center"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-card text-primary"><Scale className="size-6" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-start gap-2"><h2 className="text-lg font-bold">{party.name}</h2><StatementPartyBadge party={party} /></div><p className="mt-1 text-right font-mono text-xs text-muted-foreground" dir="ltr">{party.code || `#${party.id}`}{party.phone ? ` · ${party.phone}` : ""}</p></div><div className="shrink-0 text-right sm:text-left"><p className="text-xs text-muted-foreground">الرصيد الحالي المسجل</p><p className="mt-1 text-xl font-bold" dir="ltr">{formatStatementBalanceMoney(party.current_balance)}</p><p className="text-xs text-muted-foreground">{statementBalanceMeaning(party.type, party.current_balance)}</p></div></section> : null}

      <StatementSummary entityType={page.entityType} summary={page.statement?.summary} isLoading={page.isLoading} />

      <Tabs value={tabs.activeTab} onValueChange={(value) => tabs.setActiveTab(value as StatementTab)} dir="rtl" className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border bg-muted/40 p-1 sm:grid-cols-4">
          <TabsTrigger value="movements" className="gap-2 rounded-lg py-2.5"><Activity className="size-4" />الحركات</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2 rounded-lg py-2.5"><FileText className="size-4" />الفواتير</TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 rounded-lg py-2.5"><CreditCard className="size-4" />الدفعات</TabsTrigger>
          <TabsTrigger value="returns" className="gap-2 rounded-lg py-2.5"><RotateCcw className="size-4" />المرتجعات</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4">
          {page.error && !page.isLoading ? <TabError message="تعذر تحميل كشف الحساب. حاول مجدداً." onRetry={() => void page.mutate()} /> : <>
            <StatementMovementSummary entityType={page.entityType} summary={page.statement?.summary} isLoading={page.isLoading} />
            <div className="flex justify-end"><StatementColumnCustomizer definitions={STATEMENT_MOVEMENT_COLUMNS} visibleColumns={movementColumns.visibleColumns} onChange={movementColumns.setVisibleColumns} /></div>
            <div className="overflow-hidden rounded-xl border shadow-sm"><StatementLedgerTable entityType={page.entityType} entries={page.statement?.entries ?? []} visibleColumns={movementColumns.visibleColumns} isLoading={page.isLoading} hasSelection /></div>
          </>}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center"><div className="min-w-0 flex-1"><StatementInvoiceFilters search={tabs.invoiceSearch} status={tabs.invoiceStatus} paymentStatus={tabs.invoicePaymentStatus} onSearch={tabs.setInvoiceSearch} onStatus={tabs.setInvoiceStatus} onPaymentStatus={tabs.setInvoicePaymentStatus} disabled={tabs.invoices.isLoading} /></div><StatementColumnCustomizer definitions={STATEMENT_INVOICE_COLUMNS} visibleColumns={invoiceColumns.visibleColumns} onChange={invoiceColumns.setVisibleColumns} /></div>
          {tabs.invoices.error ? <TabError message="تعذر تحميل الفواتير. حاول مجدداً." onRetry={() => void tabs.invoices.mutate()} /> : <><StatementInvoiceSummaryCards summary={tabs.invoices.data?.summary} isLoading={tabs.invoices.isLoading} /><StatementInvoicesTable entityType={page.entityType} items={tabs.invoices.data?.items ?? []} meta={tabs.invoices.data?.meta} columns={invoiceColumns.visibleColumns} isLoading={tabs.invoices.isLoading} page={tabs.pages.invoices} onPageChange={(value) => tabs.setPage("invoices", value)} /></>}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center"><div className="min-w-0 flex-1"><StatementPaymentFilters search={tabs.paymentSearch} paymentMethod={tabs.paymentMethod} onSearch={tabs.setPaymentSearch} onPaymentMethod={tabs.setPaymentMethod} disabled={tabs.payments.isLoading} /></div><StatementColumnCustomizer definitions={STATEMENT_PAYMENT_COLUMNS} visibleColumns={paymentColumns.visibleColumns} onChange={paymentColumns.setVisibleColumns} /></div>
          {tabs.payments.error ? <TabError message="تعذر تحميل الدفعات. حاول مجدداً." onRetry={() => void tabs.payments.mutate()} /> : <><StatementPaymentSummaryCards summary={tabs.payments.data?.summary} isLoading={tabs.payments.isLoading} methodLabel={tabs.payments.data?.summary.most_used_payment_method ? STATEMENT_PAYMENT_METHOD_LABELS_AR[tabs.payments.data.summary.most_used_payment_method] ?? tabs.payments.data.summary.most_used_payment_method : "—"} /><StatementPaymentsTable entityType={page.entityType} items={tabs.payments.data?.items ?? []} meta={tabs.payments.data?.meta} columns={paymentColumns.visibleColumns} isLoading={tabs.payments.isLoading} page={tabs.pages.payments} onPageChange={(value) => tabs.setPage("payments", value)} /></>}
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center"><div className="min-w-0 flex-1"><StatementReturnFilters search={tabs.returnSearch} status={tabs.returnStatus} onSearch={tabs.setReturnSearch} onStatus={tabs.setReturnStatus} disabled={tabs.returns.isLoading} /></div><StatementColumnCustomizer definitions={STATEMENT_RETURN_COLUMNS} visibleColumns={returnColumns.visibleColumns} onChange={returnColumns.setVisibleColumns} /></div>
          {tabs.returns.error ? <TabError message="تعذر تحميل المرتجعات. حاول مجدداً." onRetry={() => void tabs.returns.mutate()} /> : <><StatementReturnSummaryCards summary={tabs.returns.data?.summary} isLoading={tabs.returns.isLoading} /><StatementReturnsTable entityType={page.entityType} items={tabs.returns.data?.items ?? []} meta={tabs.returns.data?.meta} columns={returnColumns.visibleColumns} isLoading={tabs.returns.isLoading} page={tabs.pages.returns} onPageChange={(value) => tabs.setPage("returns", value)} /></>}
        </TabsContent>
      </Tabs>
    </>}

    <DateRangeDialog open={page.customDialogOpen} onOpenChange={page.setCustomDialogOpen} from={page.customPeriod?.from ?? dialogDefault.from} to={page.customPeriod?.to ?? dialogDefault.to} onApply={page.applyCustomPeriod} />
  </div>
}

function TabError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-right"><p className="text-sm text-destructive">{message}</p><Button variant="outline" onClick={onRetry} className="gap-2"><RefreshCw className="size-4" />إعادة المحاولة</Button></div>
}
