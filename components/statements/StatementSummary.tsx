"use client"

import { ArrowDownToLine, ArrowUpFromLine, Landmark, Scale } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import {
  formatStatementMoney,
  formatStatementBalanceMoney,
  statementBalanceMeaning,
  statementBalanceColor,
  type StatementEntityType,
  type StatementSummary as StatementSummaryData,
} from "@/src/features/statements"

export function StatementSummary({ entityType, summary, isLoading = false }: { entityType: StatementEntityType; summary?: StatementSummaryData; isLoading?: boolean }) {
  const cards: SummaryCard[] = [
    { title: "الرصيد الافتتاحي", value: formatStatementBalanceMoney(summary?.opening_balance), valueDescription: summary ? `${statementBalanceMeaning(entityType, summary.opening_balance)} · الرصيد المعتمد في بداية الكشف.` : "الرصيد المعتمد في بداية الكشف.", valueDir: "ltr", icon: Landmark, colorKey: summary ? statementBalanceColor(entityType, summary.opening_balance) : "muted", showPercentage: false, showProgress: false },
    { title: "إجمالي المدين في الكشف", value: formatStatementMoney(summary?.statement_debit_total), valueDescription: "يشمل كل السجلات الظاهرة في الكشف، بما فيها الرصيد الافتتاحي عند ظهوره.", valueDir: "ltr", icon: ArrowDownToLine, colorKey: entityType === "customer" ? "success" : "warning", showPercentage: false, showProgress: false },
    { title: "إجمالي الدائن في الكشف", value: formatStatementMoney(summary?.statement_credit_total), valueDescription: "يشمل كل السجلات الظاهرة في الكشف، بما فيها الرصيد الافتتاحي عند ظهوره.", valueDir: "ltr", icon: ArrowUpFromLine, colorKey: entityType === "customer" ? "warning" : "success", showPercentage: false, showProgress: false },
    { title: "الرصيد الختامي", value: formatStatementBalanceMoney(summary?.closing_balance), valueDescription: summary ? `${statementBalanceMeaning(entityType, summary.closing_balance)} · الرصيد النهائي بعد جميع سجلات الكشف الظاهرة.` : "الرصيد النهائي بعد جميع سجلات الكشف الظاهرة.", valueDir: "ltr", icon: Scale, colorKey: summary ? statementBalanceColor(entityType, summary.closing_balance) : "muted", showPercentage: false, showProgress: false },
  ]
  return <SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} className="text-right" />
}
