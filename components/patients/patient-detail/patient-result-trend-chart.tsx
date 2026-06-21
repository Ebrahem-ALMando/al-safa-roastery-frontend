"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowDownRight,
  ArrowUpRight,
  Equal,
  Minus,
  Sigma,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatArDateTime } from "@/components/orders/orders-helpers"
import { cn } from "@/lib/utils"
import type { ComparisonEntry } from "./patient-detail-data"
import { computeTrendDirection } from "./patient-detail-data"

export type TrendChartPoint = {
  orderId: number
  orderNumber: string
  dateLabel: string
  value: number
  displayValue: string
  unit: string | null
  isMin: boolean
  isMax: boolean
}

function buildChartPoints(entries: ComparisonEntry[]): TrendChartPoint[] {
  const sorted = entries
    .filter((e): e is ComparisonEntry & { numeric: number } => e.numeric !== null)
    .sort((a, b) => {
      const ta = a.orderedAt ? new Date(a.orderedAt).getTime() : 0
      const tb = b.orderedAt ? new Date(b.orderedAt).getTime() : 0
      return ta - tb
    })

  if (sorted.length === 0) return []

  const values = sorted.map((e) => e.numeric)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return sorted.map((e) => {
    const dt = e.orderedAt ? formatArDateTime(e.orderedAt) : { date: "—", time: "" }
    return {
      orderId: e.orderId,
      orderNumber: e.orderNumber,
      dateLabel: dt.date,
      value: e.numeric,
      displayValue: [e.value, e.unit?.trim()].filter(Boolean).join(" "),
      unit: e.unit,
      isMin: e.numeric === min && min !== max,
      isMax: e.numeric === max && min !== max,
    }
  })
}

function formatNum(v: number): string {
  if (Number.isInteger(v)) return String(v)
  const abs = Math.abs(v)
  if (abs >= 100) return v.toFixed(1)
  if (abs >= 1) return v.toFixed(2)
  return v.toFixed(3)
}

type RechartsTooltipPayload = {
  active?: boolean
  payload?: { payload?: TrendChartPoint }[]
}

function ChartTooltip({ active, payload }: RechartsTooltipPayload) {
  if (!active || !payload?.[0]?.payload) return null
  const p = payload[0].payload
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="min-w-[160px] rounded-xl border border-border/80 bg-popover/95 px-3.5 py-2.5 text-right shadow-xl backdrop-blur-sm"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] font-bold text-primary" dir="ltr">
          {p.orderNumber}
        </p>
        {p.isMax ? (
          <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-200">
            أعلى
          </span>
        ) : p.isMin ? (
          <span className="rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-200">
            أدنى
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{p.dateLabel}</p>
      <p className="mt-2 font-mono text-base font-bold text-foreground" dir="ltr">
        {p.displayValue}
      </p>
    </motion.div>
  )
}

type DotProps = {
  cx?: number
  cy?: number
  index?: number
  stroke?: string
  payload?: TrendChartPoint
}

function ValueDot(props: DotProps) {
  const { cx, cy, index = 0, stroke = "hsl(var(--primary))", payload } = props
  if (cx == null || cy == null || !payload) return null

  const isMin = payload.isMin
  const isMax = payload.isMax
  const dotColor = isMax
    ? "hsl(0 72% 51%)"
    : isMin
      ? "hsl(199 89% 42%)"
      : stroke

  return (
    <g>
      {(isMin || isMax) && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={16}
          fill={dotColor}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.18, 0.08], scale: [0.6, 1.15, 1] }}
          transition={{
            delay: 0.6 + index * 0.12,
            duration: 1.2,
            ease: "easeOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.6,
          }}
        />
      )}
      <motion.circle
        cx={cx}
        cy={cy}
        r={10}
        fill={dotColor}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.14, scale: 1 }}
        transition={{ delay: 0.3 + index * 0.12, duration: 0.35, ease: "easeOut" }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={isMin || isMax ? 6 : 5}
        fill="hsl(var(--card))"
        stroke={dotColor}
        strokeWidth={isMin || isMax ? 3 : 2.5}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 + index * 0.12, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </g>
  )
}

function ValueLabel(props: {
  x?: number
  y?: number
  index?: number
  value?: string | number
  payload?: TrendChartPoint
}) {
  const { x, y, index = 0, payload } = props
  if (x == null || y == null || !payload) return null

  const color = payload.isMax
    ? "fill-rose-700 dark:fill-rose-200"
    : payload.isMin
      ? "fill-sky-700 dark:fill-sky-200"
      : "fill-foreground"

  return (
    <motion.text
      x={x}
      y={y - 14}
      textAnchor="middle"
      className={cn("text-[10.5px] font-bold tabular-nums", color)}
      initial={{ opacity: 0, y: y - 4 }}
      animate={{ opacity: 1, y: y - 14 }}
      transition={{ delay: 0.6 + index * 0.12, duration: 0.4, ease: "easeOut" }}
    >
      {payload.displayValue}
    </motion.text>
  )
}

type StatChipProps = {
  label: string
  value: string
  tone: "primary" | "rose" | "sky" | "amber" | "emerald" | "neutral"
  icon: React.ReactNode
  delay?: number
}

function StatChip({ label, value, tone, icon, delay = 0 }: StatChipProps) {
  const toneCls = {
    primary:
      "border-primary/30 bg-primary/8 text-primary [&_svg]:text-primary",
    rose:
      "border-rose-300/60 bg-rose-500/10 text-rose-800 dark:text-rose-100 [&_svg]:text-rose-600 dark:[&_svg]:text-rose-300",
    sky:
      "border-sky-300/60 bg-sky-500/10 text-sky-900 dark:text-sky-100 [&_svg]:text-sky-600 dark:[&_svg]:text-sky-300",
    amber:
      "border-amber-300/60 bg-amber-500/10 text-amber-900 dark:text-amber-100 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-300",
    emerald:
      "border-emerald-300/60 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-300",
    neutral:
      "border-border/70 bg-muted/50 text-foreground [&_svg]:text-muted-foreground",
  }[tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 shadow-sm",
        toneCls
      )}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-background/60 shadow-inner">
        {icon}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] font-medium opacity-80">{label}</p>
        <p className="font-mono text-[13px] font-bold tabular-nums" dir="ltr">
          {value}
        </p>
      </div>
    </motion.div>
  )
}

type TrendBadgeBigProps = {
  trend: "up" | "down" | "stable" | "unknown"
  deltaPct: number | null
  delay?: number
}

function TrendBadgeBig({ trend, deltaPct, delay = 0 }: TrendBadgeBigProps) {
  const up = trend === "up"
  const down = trend === "down"

  const cls = up
    ? "border-rose-300/70 bg-linear-to-bl from-rose-500/15 to-rose-500/5 text-rose-800 dark:text-rose-100"
    : down
      ? "border-sky-300/70 bg-linear-to-bl from-sky-500/15 to-sky-500/5 text-sky-900 dark:text-sky-100"
      : trend === "stable"
        ? "border-slate-300/60 bg-slate-500/10 text-slate-800 dark:text-slate-100"
        : "border-border/70 bg-muted/50 text-muted-foreground"

  const Icon = up ? TrendingUp : down ? TrendingDown : trend === "stable" ? Equal : Minus
  const label = up ? "ارتفاع إجمالي" : down ? "انخفاض إجمالي" : trend === "stable" ? "ثابت" : "—"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm",
        cls
      )}
    >
      <motion.span
        initial={{ rotate: up ? -25 : down ? 25 : 0, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: delay + 0.15, type: "spring", stiffness: 260, damping: 16 }}
        className="grid size-6 place-items-center rounded-full bg-background/70"
      >
        <Icon className="size-3.5" />
      </motion.span>
      <span className="text-[11px] font-bold">{label}</span>
      {deltaPct != null && (up || down) ? (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.3, duration: 0.3 }}
          className="font-mono text-[12px] font-bold tabular-nums"
          dir="ltr"
        >
          {up ? "+" : ""}
          {deltaPct.toFixed(1)}%
        </motion.span>
      ) : null}
    </motion.div>
  )
}

type PatientResultTrendChartProps = {
  entries: ComparisonEntry[]
  /** رسم مضغوط داخل زر المقارنة */
  compact?: boolean
  className?: string
}

export function PatientResultTrendChart({ entries, compact = false, className }: PatientResultTrendChartProps) {
  const points = React.useMemo(() => buildChartPoints(entries), [entries])
  const gradientId = React.useId().replace(/:/g, "")

  if (points.length < 2) return null

  const firstVal = points[0]!.value
  const lastVal = points[points.length - 1]!.value
  const trend = computeTrendDirection(lastVal, firstVal)
  const deltaPct =
    firstVal !== 0 && trend !== "unknown" && trend !== "stable"
      ? ((lastVal - firstVal) / Math.abs(firstVal)) * 100
      : null
  const unit = entries.find((e) => e.unit?.trim())?.unit?.trim() ?? null

  const values = points.map((p) => p.value)
  const yMin = Math.min(...values)
  const yMax = Math.max(...values)
  const avg = values.reduce((s, v) => s + v, 0) / values.length
  const yPad = (yMax - yMin) * 0.22 || Math.abs(yMax) * 0.12 || 1
  const domain: [number, number] = [yMin - yPad, yMax + yPad]

  const trendUp = trend === "up"
  const trendDown = trend === "down"
  const stroke = trendUp
    ? "hsl(0 72% 51%)"
    : trendDown
      ? "hsl(199 89% 42%)"
      : "hsl(217 91% 60%)"

  const height = compact ? 56 : 260

  const shellClass = cn(
    "overflow-hidden",
    compact
      ? "rounded-md"
      : "rounded-2xl border border-border/60 shadow-lg shadow-primary/[0.03] bg-linear-to-b from-primary/[0.06] via-card to-card",
    className
  )

  const chartContent = (
    <div className={cn("w-full", compact ? "px-1 py-1" : "px-3 pb-3 pt-2")} style={{ height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: compact ? 16 : 36, right: 18, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id={`trendFill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
              <stop offset="60%" stopColor={stroke} stopOpacity={0.12} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {!compact ? (
            <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-border/40" />
          ) : null}
          <XAxis
            dataKey="dateLabel"
            axisLine={false}
            tickLine={false}
            hide={compact}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
            dy={8}
            interval={0}
            angle={points.length > 3 ? -18 : 0}
            textAnchor={points.length > 3 ? "end" : "middle"}
            height={points.length > 3 ? 48 : 32}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            hide={compact}
            domain={domain}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={46}
            tickFormatter={formatNum}
          />
          {!compact ? (
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: stroke, strokeWidth: 1.5, strokeDasharray: "5 4", strokeOpacity: 0.5 }}
              wrapperStyle={{ outline: "none" }}
            />
          ) : null}
          {!compact ? (
            <>
              <ReferenceLine
                y={avg}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="2 4"
                strokeOpacity={0.55}
                label={{
                  value: `المتوسط ${formatNum(avg)}`,
                  position: "insideTopRight",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <ReferenceLine
                y={firstVal}
                stroke={stroke}
                strokeDasharray="6 4"
                strokeOpacity={0.35}
                ifOverflow="extendDomain"
              />
            </>
          ) : null}
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={`url(#trendFill-${gradientId})`}
            animationDuration={1400}
            animationEasing="ease-out"
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={compact ? 2 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={!compact ? `url(#glow-${gradientId})` : undefined}
            dot={compact ? false : (props: DotProps) => <ValueDot {...props} stroke={stroke} />}
            label={
              compact
                ? undefined
                : (props: { x?: number; y?: number; index?: number; value?: string | number; payload?: TrendChartPoint }) => (
                    <ValueLabel {...props} />
                  )
            }
            activeDot={{
              r: 8,
              fill: "hsl(var(--card))",
              stroke,
              strokeWidth: 3,
            }}
            animationDuration={1600}
            animationEasing="ease-out"
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  if (compact) {
    return <div className={shellClass}>{chartContent}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={shellClass}
    >
      <div
        className="relative flex flex-col gap-3 border-b border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="min-w-0 space-y-1"
        >
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            اتجاه القيمة عبر الزمن
          </p>
          <p className="text-[11px] text-muted-foreground">
            من الأقدم (يسار) إلى الأحدث (يمين) — {points.length} قياسات
            {unit ? (
              <span className="ms-1 font-mono font-semibold" dir="ltr">
                ({unit})
              </span>
            ) : null}
          </p>
        </motion.div>
        <TrendBadgeBig trend={trend} deltaPct={deltaPct} delay={0.2} />
      </div>

      <div className="flex flex-wrap items-stretch gap-2 px-4 pb-2 pt-3" dir="rtl">
        <StatChip
          label="الأول"
          value={formatNum(firstVal)}
          tone="neutral"
          icon={<ArrowUpRight className="size-3.5 -scale-x-100" />}
          delay={0.25}
        />
        <StatChip
          label="الأخير"
          value={formatNum(lastVal)}
          tone={trendUp ? "rose" : trendDown ? "sky" : "primary"}
          icon={trendUp ? <ArrowUpRight className="size-3.5" /> : trendDown ? <ArrowDownRight className="size-3.5" /> : <Equal className="size-3.5" />}
          delay={0.3}
        />
        <StatChip
          label="أدنى"
          value={formatNum(yMin)}
          tone="sky"
          icon={<ArrowDownRight className="size-3.5" />}
          delay={0.35}
        />
        <StatChip
          label="أعلى"
          value={formatNum(yMax)}
          tone="rose"
          icon={<ArrowUpRight className="size-3.5" />}
          delay={0.4}
        />
        <StatChip
          label="المتوسط"
          value={formatNum(avg)}
          tone="amber"
          icon={<Sigma className="size-3.5" />}
          delay={0.45}
        />
      </div>

      {chartContent}
    </motion.div>
  )
}
