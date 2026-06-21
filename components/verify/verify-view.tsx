'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  BadgeCheck,
  CircleAlert,
  FileX2,
  IdCard,
  ShieldCheck,
} from 'lucide-react'
import { VerifyHeader } from '@/components/verify/verify-header'
import { VerifyTestCard } from '@/components/verify/verify-test-card'
import { VerifyMetaField } from '@/components/verify/verify-meta-field'
import { VerifyCopyButton } from '@/components/verify/verify-copy-button'
import type { VerifyOrderPayload } from '@/lib/verify-types'
import { cn } from '@/lib/utils'

export type VerifyViewProps =
  | { mode: 'ok'; orderNumber: string; data: VerifyOrderPayload }
  | { mode: 'not_found'; orderNumber: string }
  | { mode: 'error'; orderNumber: string; message: string }

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'PPP', { locale: ar })
  } catch {
    return iso
  }
}

function formatGender(g: string | null | undefined): string {
  if (!g) return '—'
  const k = g.toLowerCase()
  if (k === 'male' || k === 'm') return 'ذكر'
  if (k === 'female' || k === 'f') return 'أنثى'
  return g
}

export function VerifyView(props: VerifyViewProps) {
  const [verifiedAt] = React.useState(() => new Date())

  const stats = React.useMemo(() => {
    if (props.mode !== 'ok') return { tests: 0, params: 0, abnormal: 0 }
    const tests = props.data.items.length
    const params = props.data.items.reduce((n, it) => n + it.results.length, 0)
    const abnormal = props.data.items.reduce(
      (n, it) =>
        n +
        it.results.filter(
          (r) => r.result_flag && r.result_flag !== 'normal',
        ).length,
      0,
    )
    return { tests, params, abnormal }
  }, [props])

  const hasAbnormal = stats.abnormal > 0

  return (
    <div className="min-h-screen bg-background">
      <VerifyHeader />

      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-5">
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm"
        >
          <div className="h-1 bg-primary" aria-hidden />

          <div className="border-b border-border px-4 py-3 sm:px-5 sm:py-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted"
                  aria-hidden
                >
                  <BadgeCheck className="size-6 text-primary" strokeWidth={2} />
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                    تحقق رسمي · OFFICIAL VERIFICATION
                  </p>
                  <h1 className="mt-0.5 text-lg font-bold leading-snug text-foreground sm:text-xl">
                    شهادة التحقق من صحة تقرير التحاليل
                  </h1>
                </div>
              </div>
              <dl className="shrink-0 space-y-1.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-left text-[11px] sm:text-end">
                <div>
                  <dt className="text-muted-foreground">وقت التحقق</dt>
                  <dd className="font-mono font-semibold tabular-nums text-foreground">
                    {format(verifiedAt, 'yyyy-MM-dd HH:mm')}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">المرجع</dt>
                  <dd className="font-mono font-semibold tabular-nums text-foreground">
                    {props.orderNumber}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-4">
            {props.mode === 'error' && (
              <div className="flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 dark:bg-amber-950/20">
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    تعذر إتمام التحقق
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {props.message}
                  </p>
                </div>
              </div>
            )}

            {props.mode === 'not_found' && (
              <div className="flex items-start gap-3 rounded-md border border-border border-s-4 border-s-rose-600 bg-muted/30 px-3 py-3 dark:border-s-rose-500">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                  <FileX2 className="size-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-[10px] font-semibold tracking-wider text-rose-700 dark:text-rose-400">
                    غير مسجل
                  </p>
                  <p className="mt-1 text-base font-bold text-foreground">
                    التقرير غير موجود
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    لا يوجد طلب بالرقم{' '}
                    <span className="rounded bg-muted px-1 font-mono font-semibold text-foreground">
                      {props.orderNumber}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {props.mode === 'ok' && (
              <div className="space-y-3">
                <div className="flex flex-col gap-3 rounded-md border border-border border-s-4 border-s-primary bg-muted/25 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:py-3 dark:bg-muted/15">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                      <ShieldCheck className="size-6" aria-hidden />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold tracking-wider text-emerald-800 dark:text-emerald-400">
                        تم التحقق
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        التقرير مطابق لسجلات المختبر
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 border-t border-border pt-2 sm:border-t-0 sm:border-s sm:ps-4 sm:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        رقم الطلب
                      </p>
                      <div className="mt-0.5 flex items-center justify-end gap-1">
                        <VerifyCopyButton
                          value={props.data.order_number}
                          ariaLabel="نسخ رقم الطلب"
                        />
                        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                          {props.data.order_number}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        تاريخ الإصدار
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                        {formatDate(props.data.ordered_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {hasAbnormal && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm dark:bg-amber-950/25">
                    <CircleAlert className="size-4 shrink-0 text-amber-700 dark:text-amber-400" />
                    <p className="font-medium text-foreground">
                      تنبيه:{' '}
                      <span className="tabular-nums text-amber-900 dark:text-amber-200">
                        {stats.abnormal}
                      </span>{' '}
                      نتيجة خارج المعدل — راجع الطبيب.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_11rem]">
                  <div className="rounded-md border border-border">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-1.5 dark:bg-muted/20">
                      <IdCard className="size-3.5 text-primary" aria-hidden />
                      <p className="text-[10px] font-semibold tracking-wide text-foreground">
                        بيانات المريض
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-4">
                      <VerifyMetaField
                        labelAr="الاسم"
                        labelEn="Name"
                        value={props.data.patient?.full_name ?? '—'}
                        className="col-span-2"
                      />
                      <VerifyMetaField
                        labelAr="رقم الملف"
                        labelEn="File"
                        value={props.data.patient?.patient_number ?? '—'}
                        mono
                      />
                      <VerifyMetaField
                        labelAr="الجنس"
                        labelEn="Gender"
                        value={formatGender(props.data.patient?.gender)}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-border">
                    <div className="border-b border-border bg-muted/40 px-2 py-1.5 text-center dark:bg-muted/20">
                      <p className="text-[10px] font-semibold tracking-wide text-foreground">
                        ملخص
                      </p>
                    </div>
                    <dl className="grid grid-cols-3 divide-x divide-border md:grid-cols-1 md:divide-x-0 md:divide-y">
                      <StatCell ar="تحاليل" en="Tests" value={stats.tests} />
                      <StatCell ar="معايير" en="Rows" value={stats.params} />
                      <StatCell
                        ar="تنبيه"
                        en="Flags"
                        value={stats.abnormal}
                        warn={hasAbnormal && stats.abnormal > 0}
                      />
                    </dl>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border">
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5 dark:bg-muted/20">
                    <p className="text-[10px] font-semibold text-foreground">
                      النتائج التفصيلية
                    </p>
                    <p className="text-[10px] tabular-nums text-muted-foreground">
                      {stats.tests} تحليل · {stats.params} صف
                    </p>
                  </div>
                  <div>
                    {props.data.items.map((item, index) => (
                      <VerifyTestCard key={item.id} item={item} index={index} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <footer className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-foreground">
                نظام المختبر — وثيقة آلية
              </span>
              <span className="font-mono tabular-nums">
                REF {props.orderNumber.toUpperCase()}
              </span>
            </footer>
          </div>
        </motion.article>
      </main>
    </div>
  )
}

function StatCell({
  ar,
  en,
  value,
  warn,
}: {
  ar: string
  en: string
  value: number
  warn?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-2.5 text-center md:py-3">
      <p className="text-[9px] font-medium text-muted-foreground">
        {ar} · {en}
      </p>
      <p
        className={cn(
          'mt-0.5 font-mono text-xl font-bold tabular-nums text-foreground',
          warn && 'text-rose-600 dark:text-rose-400',
        )}
      >
        {value.toString().padStart(2, '0')}
      </p>
    </div>
  )
}
