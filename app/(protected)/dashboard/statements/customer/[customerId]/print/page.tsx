import { StatementPrintView } from "@/components/statements/StatementPrintView"

type PageProps = {
  params: Promise<{ customerId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CustomerStatementPrintPage({ params, searchParams }: PageProps) {
  const route = await params
  const query = await searchParams
  const id = Number.parseInt(route.customerId, 10)
  if (!Number.isFinite(id) || id <= 0) return <div dir="rtl" className="p-8 text-center text-destructive">معرّف الزبون غير صالح.</div>
  const dateFrom = Array.isArray(query.date_from) ? query.date_from[0] : query.date_from
  const dateTo = Array.isArray(query.date_to) ? query.date_to[0] : query.date_to
  return <StatementPrintView entityType="customer" entityId={id} filters={{ date_from: dateFrom, date_to: dateTo }} />
}
