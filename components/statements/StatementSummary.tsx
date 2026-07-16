"use client"

import { ArrowDownToLine, ArrowUpFromLine, Landmark, Scale } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import {
  formatStatementMoney,
  statementBalanceMeaning,
  type StatementEntityType,
  type StatementSummary as StatementSummaryData,
} from "@/src/features/statements"

export function StatementSummary({ entityType, summary, isLoading = false }: { entityType: StatementEntityType; summary?: StatementSummaryData; isLoading?: boolean }) {
  const cards: SummaryCard[] = [
    { title: "الرصيد الافتتاحي", value: formatStatementMoney(summary?.opening_balance), valueDir: "ltr", icon: Landmark, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "إجمالي المدين خلال الفترة", value: formatStatementMoney(summary?.total_increase), valueDir: "ltr", icon: ArrowDownToLine, colorKey: "warning", showPercentage: false, showProgress: false },
    { title: "إجمالي الدائن خلال الفترة", value: formatStatementMoney(summary?.total_decrease), valueDir: "ltr", icon: ArrowUpFromLine, colorKey: "success", showPercentage: false, showProgress: false },
    { title: "الرصيد الختامي", value: formatStatementMoney(summary?.closing_balance), valueDescription: summary ? statementBalanceMeaning(entityType, summary.closing_balance) : undefined, valueDir: "ltr", icon: Scale, colorKey: "danger", showPercentage: false, showProgress: false },
  ]
  return <SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} className="text-right" />
}
