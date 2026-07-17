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
    { title: "الرصيد الافتتاحي", value: formatStatementBalanceMoney(summary?.opening_balance), valueDescription: summary ? statementBalanceMeaning(entityType, summary.opening_balance) : undefined, valueDir: "ltr", icon: Landmark, colorKey: summary ? statementBalanceColor(entityType, summary.opening_balance) : "muted", showPercentage: false, showProgress: false },
    { title: "إجمالي المدين خلال الفترة", value: formatStatementMoney(summary?.total_increase), valueDescription: entityType === "customer" ? "زيادة في رصيدنا على الزبون" : "زيادة في التزامنا للمورد", valueDir: "ltr", icon: ArrowDownToLine, colorKey: entityType === "customer" ? "success" : "warning", showPercentage: false, showProgress: false },
    { title: "إجمالي الدائن خلال الفترة", value: formatStatementMoney(summary?.total_decrease), valueDescription: entityType === "customer" ? "تخفيض في رصيدنا على الزبون" : "تخفيض في التزامنا للمورد", valueDir: "ltr", icon: ArrowUpFromLine, colorKey: entityType === "customer" ? "warning" : "success", showPercentage: false, showProgress: false },
    { title: "الرصيد الختامي", value: formatStatementBalanceMoney(summary?.closing_balance), valueDescription: summary ? statementBalanceMeaning(entityType, summary.closing_balance) : undefined, valueDir: "ltr", icon: Scale, colorKey: summary ? statementBalanceColor(entityType, summary.closing_balance) : "muted", showPercentage: false, showProgress: false },
  ]
  return <SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} className="text-right" />
}
