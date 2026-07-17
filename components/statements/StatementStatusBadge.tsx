import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATEMENT_STATUS_LABELS_AR } from "@/src/features/statements"

export function StatementStatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={cn("rounded-full", status === "completed" || status === "paid" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : status === "cancelled" ? "border-rose-500/30 bg-rose-500/10 text-rose-700" : status === "partial" ? "border-amber-500/30 bg-amber-500/10 text-amber-700" : "border-sky-500/30 bg-sky-500/10 text-sky-700")}>{STATEMENT_STATUS_LABELS_AR[status] ?? status}</Badge>
}
