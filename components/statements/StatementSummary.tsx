"use client"

import { ArrowDownToLine, ArrowUpFromLine, Landmark, Scale } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import { formatStatementMoney, type StatementSummary as StatementSummaryData } from "@/src/features/statements"

export function StatementSummary({ summary, isLoading = false }: { summary?: StatementSummaryData; isLoading?: boolean }) {
  const cards: SummaryCard[] = [
    { title: "الرصيد الافتتاحي", value: formatStatementMoney(summary?.opening_balance), icon: Landmark, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "إجمالي المدين خلال الفترة", value: formatStatementMoney(summary?.total_increase), icon: ArrowDownToLine, colorKey: "warning", showPercentage: false, showProgress: false },
    { title: "إجمالي الدائن خلال الفترة", value: formatStatementMoney(summary?.total_decrease), icon: ArrowUpFromLine, colorKey: "success", showPercentage: false, showProgress: false },
    { title: "الرصيد الختامي", value: formatStatementMoney(summary?.closing_balance), icon: Scale, colorKey: "danger", showPercentage: false, showProgress: false },
  ]
  return <SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} />
}
