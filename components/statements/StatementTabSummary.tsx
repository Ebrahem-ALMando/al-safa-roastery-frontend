"use client"

import { ArrowDownToLine, ArrowUpFromLine, Calculator, CalendarClock, CreditCard, FileText, Hash, ReceiptText, Scale, WalletCards } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import { formatStatementBalanceMoney, formatStatementDate, formatStatementMoney, statementBalanceMeaning, type StatementEntityType, type StatementInvoiceSummary, type StatementMovementSummary as MovementSummaryData, type StatementPaymentSummary, type StatementReturnSummary } from "@/src/features/statements"

function Cards({ cards, isLoading }: { cards: SummaryCard[]; isLoading: boolean }) {
  return <SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} className="text-right" />
}

export function StatementMovementSummary({ entityType, summary, isLoading }: { entityType: StatementEntityType; summary?: MovementSummaryData; isLoading: boolean }) {
  const cards: SummaryCard[] = [
    { title: "عدد السجلات المعروضة", value: String(summary?.displayed_records_count ?? 0), valueDir: "ltr", valueDescription: "يشمل الرصيد الافتتاحي عند ظهوره في الجدول.", icon: Hash, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "إجمالي المدين المعروض", value: formatStatementMoney(summary?.displayed_debit_total), valueDir: "ltr", valueDescription: "يعتمد على السجلات الظاهرة في جدول الحركات.", icon: ArrowDownToLine, colorKey: entityType === "customer" ? "success" : "warning", showPercentage: false, showProgress: false },
    { title: "إجمالي الدائن المعروض", value: formatStatementMoney(summary?.displayed_credit_total), valueDir: "ltr", valueDescription: "يعتمد على السجلات الظاهرة في جدول الحركات.", icon: ArrowUpFromLine, colorKey: entityType === "customer" ? "warning" : "success", showPercentage: false, showProgress: false },
    { title: "صافي السجلات المعروضة", value: formatStatementBalanceMoney(summary?.displayed_net_total), valueDir: "ltr", valueDescription: summary ? `${statementBalanceMeaning(entityType, summary.displayed_net_total)} · صافي المدين والدائن للسجلات الظاهرة.` : undefined, icon: Scale, colorKey: "secondary", showPercentage: false, showProgress: false },
  ]
  return <Cards cards={cards} isLoading={isLoading} />
}

export function StatementInvoiceSummaryCards({ summary, isLoading }: { summary?: StatementInvoiceSummary; isLoading: boolean }) {
  return <Cards isLoading={isLoading} cards={[
    { title: "عدد الفواتير", value: summary?.invoices_count ?? 0, valueDescription: "وفق الفلاتر الحالية", icon: FileText, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "إجمالي الفواتير", value: formatStatementMoney(summary?.total_amount), valueDir: "ltr", valueDescription: "قيمة الفواتير الكلية", icon: ReceiptText, colorKey: "primary", showPercentage: false, showProgress: false },
    { title: "إجمالي المدفوع", value: formatStatementMoney(summary?.paid_amount), valueDir: "ltr", valueDescription: "المبالغ المسددة", icon: CreditCard, colorKey: "success", showPercentage: false, showProgress: false },
    { title: "إجمالي المتبقي", value: formatStatementMoney(summary?.remaining_amount), valueDir: "ltr", valueDescription: "المبالغ غير المسددة", icon: WalletCards, colorKey: "warning", showPercentage: false, showProgress: false },
  ]} />
}

export function StatementPaymentSummaryCards({ summary, isLoading, methodLabel }: { summary?: StatementPaymentSummary; isLoading: boolean; methodLabel: string }) {
  return <Cards isLoading={isLoading} cards={[
    { title: "عدد الدفعات", value: summary?.payments_count ?? 0, valueDescription: "وفق الفلاتر الحالية", icon: Hash, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "إجمالي الدفعات", value: formatStatementMoney(summary?.total_amount), valueDir: "ltr", valueDescription: "إجمالي المبالغ المدفوعة", icon: CreditCard, colorKey: "success", showPercentage: false, showProgress: false },
    { title: "آخر دفعة", value: formatStatementDate(summary?.latest_payment_date), valueDescription: "أحدث دفعة ضمن النتائج", icon: CalendarClock, colorKey: "secondary", showPercentage: false, showProgress: false },
    { title: "الأكثر استخداماً", value: methodLabel, valueDescription: "طريقة الدفع الأكثر تكراراً", icon: WalletCards, colorKey: "primary", showPercentage: false, showProgress: false },
  ]} />
}

export function StatementReturnSummaryCards({ summary, isLoading }: { summary?: StatementReturnSummary; isLoading: boolean }) {
  return <Cards isLoading={isLoading} cards={[
    { title: "عدد المرتجعات", value: summary?.returns_count ?? 0, valueDescription: "وفق الفلاتر الحالية", icon: Hash, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "إجمالي المرتجعات", value: formatStatementMoney(summary?.total_amount), valueDir: "ltr", valueDescription: "قيمة المرتجعات الكلية", icon: ReceiptText, colorKey: "warning", showPercentage: false, showProgress: false },
    { title: "آخر مرتجع", value: formatStatementDate(summary?.latest_return_date), valueDescription: "أحدث مرتجع ضمن النتائج", icon: CalendarClock, colorKey: "secondary", showPercentage: false, showProgress: false },
    { title: "متوسط قيمة المرتجع", value: formatStatementMoney(summary?.average_amount), valueDir: "ltr", valueDescription: "متوسط جميع النتائج المفلترة", icon: Calculator, colorKey: "primary", showPercentage: false, showProgress: false },
  ]} />
}
