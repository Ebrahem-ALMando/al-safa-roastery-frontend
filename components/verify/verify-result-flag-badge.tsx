'use client'

import { cn } from '@/lib/utils'

const LABELS_AR: Record<string, string> = {
  normal: 'طبيعي',
  low: 'منخفض',
  high: 'مرتفع',
  abnormal: 'غير طبيعي',
}

const LABELS_EN: Record<string, string> = {
  normal: 'NORMAL',
  low: 'LOW',
  high: 'HIGH',
  abnormal: 'ABNORMAL',
}

type VerifyResultFlagBadgeProps = {
  flag: string | null | undefined
  showEnglish?: boolean
}

export function VerifyResultFlagBadge({
  flag,
  showEnglish = true,
}: VerifyResultFlagBadgeProps) {
  const key = flag ?? 'normal'
  const ar = LABELS_AR[key] ?? key
  const en = LABELS_EN[key] ?? key.toUpperCase()
  const isNormal = key === 'normal'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-none',
        isNormal
          ? 'border-border bg-muted text-foreground dark:bg-muted/50'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:border-rose-400/40 dark:bg-rose-950/40 dark:text-rose-100',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          isNormal ? 'bg-primary' : 'bg-rose-600 dark:bg-rose-400',
        )}
      />
      <span className="tabular-nums">{ar}</span>
      {showEnglish && (
        <span className="text-[9px] font-semibold tracking-wider text-muted-foreground">
          {en}
        </span>
      )}
    </span>
  )
}
