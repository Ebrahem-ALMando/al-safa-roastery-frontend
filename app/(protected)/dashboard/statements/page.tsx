import { StatementsView } from "@/components/statements/StatementsView"
import type { StatementEntityType } from "@/src/features/statements"

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function StatementsPage({ searchParams }: PageProps) {
  const query = await searchParams
  const rawType = Array.isArray(query.type) ? query.type[0] : query.type
  const entityType: StatementEntityType = rawType === "supplier" ? "supplier" : "customer"
  const rawId = Array.isArray(query.id) ? query.id[0] : query.id
  const parsedId = rawId ? Number.parseInt(rawId, 10) : NaN
  const entityId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null

  return <StatementsView initialEntityType={entityType} initialEntityId={entityId} />
}
