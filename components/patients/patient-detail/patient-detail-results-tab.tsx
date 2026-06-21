"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  CalendarClock,
  FlaskConical,
  GitCompareArrows,
  Hash,
  Layers,
  Search,
  TrendingUp,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionTitle } from "@/components/orders/order-detail-primitives"
import { formatArDateTime, getOrderStatusClassName, getOrderStatusLabel } from "@/components/orders/orders-helpers"
import type { LabOrder } from "@/features/orders"
import { cn } from "@/lib/utils"
import {
  buildComparableFieldMap,
  buildVisibleResultIdSet,
  computeResultsSummary,
  filterResultRows,
  groupResultsByOrder,
  ORDER_RESULT_THEMES,
  rowsToComparisonEntries,
  type FlatResultRow,
} from "./patient-detail-data"
import { PatientOrderItemResults } from "./patient-order-item-results"
import { PatientResultComparisonDialog } from "./patient-result-comparison-dialog"
import { filterResultsForReport } from "@/features/results/lib/report-result-inclusion"

type PatientDetailResultsTabProps = {
  orders: LabOrder[]
  resultRows: FlatResultRow[]
  metadataLoading?: boolean
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
  delay = 0,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone?: "primary" | "amber" | "rose" | "emerald"
  delay?: number
}) {
  const toneCls =
    tone === "amber"
      ? "border-amber-200/70 bg-linear-to-bl from-amber-50/90 to-amber-50/30 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-amber-950/10 [&_.icon-wrap]:bg-amber-500/15 [&_.icon-wrap]:text-amber-700 dark:[&_.icon-wrap]:text-amber-300"
      : tone === "rose"
        ? "border-rose-200/70 bg-linear-to-bl from-rose-50/90 to-rose-50/30 dark:border-rose-900/40 dark:from-rose-950/30 dark:to-rose-950/10 [&_.icon-wrap]:bg-rose-500/15 [&_.icon-wrap]:text-rose-700 dark:[&_.icon-wrap]:text-rose-300"
        : tone === "emerald"
          ? "border-emerald-200/70 bg-linear-to-bl from-emerald-50/90 to-emerald-50/30 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-emerald-950/10 [&_.icon-wrap]:bg-emerald-500/15 [&_.icon-wrap]:text-emerald-700 dark:[&_.icon-wrap]:text-emerald-300"
          : "border-primary/25 bg-linear-to-bl from-primary/8 to-primary/[0.02] [&_.icon-wrap]:bg-primary/15 [&_.icon-wrap]:text-primary"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex items-center gap-3 rounded-2xl border p-3 shadow-sm transition-shadow hover:shadow-md", toneCls)}
    >
      <div className="icon-wrap grid size-10 shrink-0 place-items-center rounded-xl shadow-inner">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.15, duration: 0.4 }}
          className="font-mono text-2xl font-bold tabular-nums leading-none"
          dir="ltr"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  )
}

export function PatientDetailResultsTab({
  orders,
  resultRows,
  metadataLoading = false,
}: PatientDetailResultsTabProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const urlQuery = searchParams.get("q") ?? ""
  const [localQuery, setLocalQuery] = React.useState(urlQuery)
  const onQueryChangeRef = React.useRef<(q: string) => void>(() => {})

  React.useEffect(() => {
    setLocalQuery(urlQuery)
  }, [urlQuery])

  onQueryChangeRef.current = (q: string) => {
    const next = new URLSearchParams(searchParams.toString())
    const trimmed = q.trim()
    if (trimmed) next.set("q", trimmed)
    else next.delete("q")
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim() === urlQuery.trim()) return
      onQueryChangeRef.current(localQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [localQuery, urlQuery])

  const filteredRows = React.useMemo(
    () => filterResultRows(resultRows, localQuery),
    [resultRows, localQuery]
  )

  const comparable = React.useMemo(() => buildComparableFieldMap(filteredRows), [filteredRows])
  const groups = React.useMemo(
    () => groupResultsByOrder(orders, filteredRows),
    [orders, filteredRows]
  )
  const summary = React.useMemo(
    () => computeResultsSummary(filteredRows, comparable),
    [filteredRows, comparable]
  )

  const visibleResultIds = React.useMemo(
    () => buildVisibleResultIdSet(orders, filteredRows),
    [orders, filteredRows]
  )

  const hasSearch = localQuery.trim().length > 0
  const isFilteredEmpty = hasSearch && filteredRows.length === 0

  const [comparisonOpen, setComparisonOpen] = React.useState(false)
  const [comparisonTarget, setComparisonTarget] = React.useState<{
    testName: string
    fieldName: string
    fieldKey: string
  } | null>(null)

  const comparisonEntries = React.useMemo(() => {
    if (!comparisonTarget) return []
    const rows = comparable.get(comparisonTarget.fieldKey) ?? []
    return rowsToComparisonEntries(rows)
  }, [comparable, comparisonTarget])

  const openComparison = (row: FlatResultRow) => {
    setComparisonTarget({
      testName: row.testName,
      fieldName: row.fieldName,
      fieldKey: row.fieldKey,
    })
    setComparisonOpen(true)
  }

  if (resultRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-10 text-center">
        <FlaskConical className="size-8 text-muted-foreground" />
        <p className="font-semibold">لا توجد نتائج في هذه الصفحة</p>
        <p className="text-xs text-muted-foreground">اختر تبويب الطلبات أو أنشئ طلباً جديداً.</p>
      </div>
    )
  }

  return (
    <>
      <PatientResultComparisonDialog
        open={comparisonOpen}
        onOpenChange={(open) => {
          setComparisonOpen(open)
          if (!open) setComparisonTarget(null)
        }}
        testName={comparisonTarget?.testName ?? ""}
        fieldName={comparisonTarget?.fieldName ?? ""}
        entries={comparisonEntries}
      />

      <SectionTitle
        icon={FlaskConical}
        title="نتائج الحقول"
        hint="مجمّعة حسب الطلب والفحص والأقسام — المقارنة للتحاليل المتكررة عبر الطلبات المعروضة"
      />

      {metadataLoading ? (
        <p className="text-xs text-muted-foreground">جاري تحميل بيانات أقسام القوالب…</p>
      ) : null}

      <motion.div
        className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/50 p-3 shadow-sm sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div className="relative min-w-0 flex-1" role="search">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="بحث بالفحص، البند، رقم الطلب، القيمة، المرجع..."
            className="h-10 w-full rounded-xl border-border/70 bg-background/80 pr-10 pl-9 text-sm"
            dir="rtl"
            aria-label="بحث في نتائج المريض"
          />
          {hasSearch ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute left-1 top-1/2 size-7 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setLocalQuery("")}
              aria-label="مسح البحث"
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </motion.div>
        {hasSearch ? (
          <p className="shrink-0 text-center text-xs text-muted-foreground sm:text-end">
            عرض{" "}
            <span className="font-mono font-bold text-foreground tabular-nums" dir="ltr">
              {filteredRows.length}
            </span>{" "}
            من{" "}
            <span className="font-mono font-bold tabular-nums" dir="ltr">
              {resultRows.length}
            </span>{" "}
            نتيجة
          </p>
        ) : null}
      </motion.div>

      {isFilteredEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <Search className="size-8 text-muted-foreground opacity-60" />
          <p className="font-semibold">لا توجد نتائج مطابقة</p>
          <p className="text-xs text-muted-foreground">
            جرّب كلمة أخرى أو{" "}
            <button
              type="button"
              className="font-semibold text-primary underline-offset-2 hover:underline"
              onClick={() => setLocalQuery("")}
            >
              امسح البحث
            </button>
          </p>
        </div>
      ) : (
        <>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="إجمالي النتائج"
          value={summary.totalResults}
          icon={<Layers className="size-5" />}
          tone="emerald"
          delay={0.05}
        />
        <SummaryCard
          label="طلبات في العرض"
          value={summary.orderCount}
          icon={<Hash className="size-5" />}
          tone="primary"
          delay={0.1}
        />
        <SummaryCard
          label="قابلة للمقارنة"
          value={summary.comparableFields}
          icon={<GitCompareArrows className="size-5" />}
          tone="amber"
          delay={0.15}
        />
        <SummaryCard
          label="خارج المعدل"
          value={summary.abnormalCount}
          icon={<AlertTriangle className="size-5" />}
          tone="rose"
          delay={0.2}
        />
      </div>

      <div className="space-y-4">
        {groups.map((group, groupIndex) => {
          const theme = ORDER_RESULT_THEMES[group.themeIndex % ORDER_RESULT_THEMES.length]!
          const dt = group.orderedAt ? formatArDateTime(group.orderedAt) : { date: "—", time: "" }
          const groupAbnormal = group.rows.filter((r) => r.flag && r.flag !== "normal").length

          return (
            <motion.section
              key={group.orderId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + groupIndex * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "group/section overflow-hidden rounded-2xl border shadow-sm ring-1 ring-inset transition-shadow hover:shadow-md",
                theme.border,
                theme.ring
              )}
            >
              <header
                className={cn(
                  "flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                  theme.header,
                  theme.border
                )}
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15 + groupIndex * 0.06, type: "spring", stiffness: 280, damping: 18 }}
                      className={cn("relative grid size-6 shrink-0 place-items-center rounded-full text-white shadow-sm", theme.dot)}
                      aria-hidden
                    >
                      <span className="text-[10px] font-bold tabular-nums">{groupIndex + 1}</span>
                      <span className={cn("pointer-events-none absolute inset-0 -z-10 rounded-full opacity-60 blur-md", theme.dot)} />
                    </motion.span>
                    <p className={cn("font-mono text-sm font-bold", theme.accent)} dir="ltr">
                      {group.orderNumber}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold shadow-sm", getOrderStatusClassName(group.status))}
                    >
                      {getOrderStatusLabel(group.status)}
                    </Badge>
                    {groupAbnormal > 0 ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + groupIndex * 0.06 }}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-300/70 bg-rose-500/10 px-2 py-0.5 text-[10.5px] font-bold text-rose-800 shadow-sm dark:text-rose-100"
                      >
                        <AlertTriangle className="size-2.5" />
                        {groupAbnormal} خارج المعدل
                      </motion.span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5 shrink-0" />
                    <span>{dt.date}</span>
                    {dt.time ? (
                      <>
                        <span aria-hidden>·</span>
                        <span dir="ltr">{dt.time}</span>
                      </>
                    ) : null}
                    <span aria-hidden>·</span>
                    <span className="font-semibold tabular-nums" dir="ltr">{group.rows.length}</span>
                    <span>نتيجة</span>
                  </div>
                </div>
              </header>

              <div className={cn("space-y-2.5 p-3 sm:p-4", theme.bg)}>
                {(() => {
                  const order = orders.find((o) => o.id === group.orderId)
                  const items = (order?.items ?? []).filter((item) =>
                    filterResultsForReport(item).some((r) => visibleResultIds.has(r.id))
                  )
                  return items.map((item) => (
                    <PatientOrderItemResults
                      key={item.id}
                      item={item}
                      orderId={group.orderId}
                      visibleResultIds={visibleResultIds}
                      comparable={comparable}
                      onCompare={openComparison}
                    />
                  ))
                })()}
              </div>
            </motion.section>
          )
        })}
      </div>

      {summary.comparableFields > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-linear-to-bl from-amber-50/80 to-amber-50/20 p-3 text-xs text-amber-950 shadow-sm dark:border-amber-900/40 dark:from-amber-950/25 dark:to-amber-950/5 dark:text-amber-100"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-700 shadow-inner dark:text-amber-200">
            <TrendingUp className="size-4" />
          </span>
          <p className="pt-0.5 leading-relaxed">
            التحاليل المميزة بزر «مقارنة» تظهر في أكثر من طلب ضمن الصفحة الحالية. استخدم التصفح في
            تبويب الطلبات لتحميل طلبات إضافية وتوسيع المقارنة.
          </p>
        </motion.div>
      ) : null}
        </>
      )}
    </>
  )
}
