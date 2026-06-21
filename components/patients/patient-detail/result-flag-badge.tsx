"use client"

import { motion } from "framer-motion"
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2 } from "lucide-react"
import { containsArabicScript, tajawalFontClass } from "@/lib/arabic-typography"
import { cn } from "@/lib/utils"
import type { LabOrderResultFlag } from "@/features/orders"
import { getResultFlagLabelAr } from "@/components/orders/orders-helpers"
import { flagBadgeClass, flagDotClass } from "./patient-detail-data"

type ResultFlagBadgeProps = {
  flag: string | null
  size?: "sm" | "md"
  animate?: boolean
  className?: string
}

function FlagIcon({
  flag,
  size,
  animate,
}: {
  flag: string | null
  size: "sm" | "md"
  animate: boolean
}) {
  const cls = size === "md" ? "size-3" : "size-2.5"
  const arrowMotion =
    animate && (flag === "high" || flag === "low")
      ? {
          animate: { y: flag === "high" ? [-1, 1, -1] : [1, -1, 1] },
          transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const },
        }
      : null

  const icon =
    flag === "high" ? (
      <ArrowUp className={cls} />
    ) : flag === "low" ? (
      <ArrowDown className={cls} />
    ) : flag === "abnormal" ? (
      <AlertTriangle className={cls} />
    ) : (
      <CheckCircle2 className={cls} />
    )

  if (arrowMotion) {
    return <motion.span {...arrowMotion}>{icon}</motion.span>
  }

  return icon
}

export function ResultFlagBadge({ flag, size = "sm", animate = true, className }: ResultFlagBadgeProps) {
  const label = getResultFlagLabelAr(flag as LabOrderResultFlag | null)
  const isAbnormal = flag && flag !== "normal"

  const Wrapper = animate ? motion.span : "span"
  const animProps = animate
    ? {
        initial: { opacity: 0, scale: 0.85, y: 2 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as const },
      }
    : {}

  return (
    <Wrapper
      {...animProps}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold shadow-sm",
        size === "md" ? "px-2.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-[10.5px]",
        flagBadgeClass(flag),
        className
      )}
    >
      <span
        className={cn(
          "relative grid place-items-center rounded-full",
          size === "md" ? "size-4" : "size-3.5",
          "bg-background/50"
        )}
      >
        <FlagIcon flag={flag} size={size} animate={animate} />
        {isAbnormal && animate ? (
          <motion.span
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              flagDotClass(flag)
            )}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", repeatDelay: 0.4 }}
          />
        ) : null}
      </span>
      <span className={containsArabicScript(label) ? tajawalFontClass : undefined}>
        {label}
      </span>
    </Wrapper>
  )
}
