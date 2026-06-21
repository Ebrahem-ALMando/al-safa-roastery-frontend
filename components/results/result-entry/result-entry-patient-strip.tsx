"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CalendarClock, FlaskConical, Hash, Stethoscope, UserRound } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LabOrder } from "@/features/orders"
import {
  formatOrderedAt,
  getResultsProgressStatus,
  resultsProgressLabels,
} from "@/components/results/results-helpers"
import { getOrderStatusClassName, getOrderStatusLabel } from "@/components/orders/orders-helpers"
import { OrderPersonCell } from "@/components/orders/order-person-cell"
import {
  patientApproxAgeYears,
  patientGenderLabelAr,
  patientPediatricVsAdultAr,
  formatAgeDisplay,
} from "@/lib/patient-clinical-display"
import { usePatient } from "@/features/patients"
import { cn } from "@/lib/utils"

type ResultEntryPatientStripProps = {
  order: LabOrder
}

function MetaChip({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: ReactNode
  label: string
  value: string
  tone?: "neutral" | "primary" | "emerald" | "sky" | "amber"
}) {
  const toneCls =
    tone === "primary"
      ? "border-primary/25 bg-primary/8 text-primary"
      : tone === "emerald"
        ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-800 dark:text-emerald-200"
        : tone === "sky"
          ? "border-sky-500/25 bg-sky-500/8 text-sky-800 dark:text-sky-100"
          : tone === "amber"
            ? "border-amber-500/25 bg-amber-500/8 text-amber-800 dark:text-amber-100"
            : "border-border/60 bg-muted/40 text-foreground/85"
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-medium",
        toneCls
      )}
    >
      <span className="shrink-0 opacity-90">{icon}</span>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="truncate text-[12px] font-semibold text-foreground" dir="ltr">
        {value}
      </span>
    </div>
  )
}

export function ResultEntryPatientStrip({ order }: ResultEntryPatientStripProps) {
  const orderedAt = formatOrderedAt(order)
  const u = order.requested_by_user
  const doctorName = u?.name?.trim() || order.requesting_doctor_name?.trim() || "—"
  const doctorSecondary = u?.username?.trim()
    ? `@${u.username}`
    : order.requested_by != null
      ? `#${order.requested_by}`
      : "الطبيب المحوّل"

  const needsPatientDetails =
    !order.patient ||
    !order.patient.date_of_birth ||
    !order.patient.gender ||
    !order.patient.patient_number

  const { patient: patientDetails } = usePatient(needsPatientDetails ? order.patient_id : null)

  const patientName =
    order.patient?.full_name?.trim() ||
    patientDetails?.full_name?.trim() ||
    "—"

  const patientNumber =
    order.patient?.patient_number?.trim() ||
    patientDetails?.patient_number?.trim() ||
    null

  const patientSecondary = patientNumber ? patientNumber : `patient_id: ${order.patient_id}`

  const prog = getResultsProgressStatus(order)

  const effectiveGender = order.patient?.gender ?? patientDetails?.gender ?? null
  const effectiveDob = order.patient?.date_of_birth ?? patientDetails?.date_of_birth ?? null

  const genderDisplay = patientGenderLabelAr(effectiveGender)
  const ageYs = patientApproxAgeYears(effectiveDob)
  const ageDisplay = ageYs != null && !Number.isNaN(ageYs) ? formatAgeDisplay(ageYs) : null
  const ageBandDisplay = patientPediatricVsAdultAr(effectiveDob)
  const progCfg = resultsProgressLabels[prog]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-border/60 bg-linear-to-bl from-primary/5 via-card to-card shadow-sm",
          "before:pointer-events-none before:absolute before:-right-24 before:-top-24 before:size-72 before:rounded-full before:bg-primary/5 before:blur-3xl",
          "after:pointer-events-none after:absolute after:-bottom-24 after:-left-16 after:size-64 after:rounded-full after:bg-emerald-500/5 after:blur-3xl"
        )}
      >
        <div className="flex flex-col gap-6 p-5 md:flex-row md:items-start md:justify-between lg:items-center">
          
          {/* قسم المريض (يمين) */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <UserRound className="size-3.5" />
              المريض
            </div>
            <div className="flex min-w-0 items-center gap-2" dir="rtl">
              <OrderPersonCell
                name={patientName}
                secondary={patientSecondary}
                avatarUrl={null}
                size="md"
                className="min-w-0 flex-1"
              />
              {order.patient_id ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 gap-1.5 rounded-lg px-2.5 text-xs font-semibold"
                  asChild
                >
                  <Link href={`/dashboard/patients/${order.patient_id}`}>
                    <UserRound className="size-3.5" />
                    الملف الشخصي
                  </Link>
                </Button>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {genderDisplay ? (
                <MetaChip
                  tone="emerald"
                  icon={<UserRound className="size-3.5" />}
                  label="الجنس:"
                  value={genderDisplay}
                />
              ) : null}
              {ageBandDisplay ? (
                <MetaChip
                  tone="sky"
                  icon={<CalendarClock className="size-3.5" />}
                  label="الفئة:"
                  value={ageBandDisplay}
                />
              ) : null}
              {ageDisplay ? (
                <MetaChip

                  tone="amber"
                  icon={<CalendarClock className="size-3.5" />}
                  label="العمر (سنة):"
                  value={`${ageDisplay}  `}
                />
              ) : null}
            </div>
          </div>

          {/* خط فاصل للشاشات المتوسطة والكبيرة */}
          <div className="hidden h-24 w-px bg-border/40 lg:block" />

          {/* قسم معلومات الطلب (وسط) */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <MetaChip
                tone="primary"
                icon={<Hash className="size-3.5" />}
                label="رقم الطلب"
                value={order.order_number}
              />
              <MetaChip
                tone="neutral"
                icon={<CalendarClock className="size-3.5" />}
                label="التاريخ"
                value={`${orderedAt.date} · ${orderedAt.time}`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-xl px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5",
                  getOrderStatusClassName(order.status)
                )}
              >
                <FlaskConical className="size-3.5" />
                <span>{getOrderStatusLabel(order.status)}</span>
              </Badge>
              <Badge 
                variant="outline"
                className={cn("rounded-xl px-3 py-1.5 text-[11px] font-semibold", progCfg.badgeClass)}
              >
                {progCfg.label}
              </Badge>
            </div>
          </div>

          {/* خط فاصل للشاشات المتوسطة والكبيرة */}
          <div className="hidden h-24 w-px bg-border/40 lg:block" />

          {/* قسم الطبيب (يسار) */}
          <div className="flex min-w-0 flex-col gap-3 md:items-end">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Stethoscope className="size-3.5" />
              الطبيب المحوّل
            </div>
            <OrderPersonCell
              name={doctorName}
              secondary={doctorSecondary}
              avatarUrl={u?.avatar_url ?? null}
              size="md"
            />
          </div>
          
        </div>
      </Card>
    </motion.div>
  )
}
