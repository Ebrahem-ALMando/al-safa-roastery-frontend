import { Badge } from "@/components/ui/badge"
import { statementEntryLabel, type StatementEntry } from "@/src/features/statements"

export function StatementEntryTypeBadge({ entry }: { entry: StatementEntry }) {
  const cancelled = entry.status === "cancelled"
  return <Badge variant="secondary" className={cancelled ? "border border-rose-500/30 bg-rose-500/10 text-rose-700" : "border border-sky-500/30 bg-sky-500/10 text-sky-700"}>{statementEntryLabel(entry)}{cancelled ? " · ملغاة" : ""}</Badge>
}
