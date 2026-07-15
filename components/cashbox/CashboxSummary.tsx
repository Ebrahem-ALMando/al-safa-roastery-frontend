"use client"

import { ArrowDownToLine, ArrowUpFromLine, ListChecks, Wallet } from "lucide-react"
import { SummaryCards, type SummaryCard } from "@/components/ui/summary-cards"
import { getThemeById } from "@/components/ui/summary-cards-themes"
import { formatCashboxMoney, type CashboxSummary as CashboxSummaryData } from "@/src/features/cashbox"

export function CashboxSummary({ summary, isLoading, error }: { summary?: CashboxSummaryData; isLoading?: boolean; error?: Error }) {
  const cards: SummaryCard[] = [
    { title: "رصيد الصندوق الحالي", value: formatCashboxMoney(summary?.current_balance), icon: Wallet, colorKey: "info", showPercentage: false, showProgress: false },
    { title: "إجمالي الوارد خلال الفترة", value: formatCashboxMoney(summary?.total_in), icon: ArrowDownToLine, colorKey: "success", showPercentage: false, showProgress: false },
    { title: "إجمالي الصادر خلال الفترة", value: formatCashboxMoney(summary?.total_out), icon: ArrowUpFromLine, colorKey: "danger", showPercentage: false, showProgress: false },
    { title: "عدد الحركات خلال الفترة", value: summary?.transactions_count ?? 0, icon: ListChecks, colorKey: "warning", showPercentage: false, showProgress: false },
  ]
  return <div className="space-y-2">{error ? <p className="text-center text-xs text-muted-foreground">تعذر تحميل ملخص الصندوق.</p> : null}<SummaryCards cards={cards} isLoading={isLoading} theme={getThemeById("default")} /></div>
}
