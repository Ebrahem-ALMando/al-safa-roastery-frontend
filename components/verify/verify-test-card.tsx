'use client'

import { motion } from 'framer-motion'
import { Microscope } from 'lucide-react'
import { formatVerifyReferenceDisplayBlock } from '@/lib/format-verify-reference'
import type { VerifyOrderItem } from '@/lib/verify-types'
import { VerifyResultFlagBadge } from '@/components/verify/verify-result-flag-badge'
import { cn } from '@/lib/utils'

type VerifyTestCardProps = {
  item: VerifyOrderItem
  index: number
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function VerifyTestCard({ item, index }: VerifyTestCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: 'easeOut' }}
      className="border-t border-border first:border-t-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-e-[3px] border-primary bg-muted/30 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <Microscope
            className="size-4 shrink-0 text-primary"
            aria-hidden
          />
          <h3 className="text-[13px] font-bold text-foreground sm:text-sm">
            {item.test_name}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="tabular-nums">{item.results.length} معيار</span>
          {item.is_abnormal && (
            <span className="rounded border border-rose-500/35 bg-rose-500/10 px-1.5 py-0.5 font-medium text-rose-800 dark:text-rose-200">
              خارج المعدل
            </span>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <table className="w-full table-fixed border-collapse text-right text-[12px]">
          <colgroup>
            <col className="w-[32%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[10px] font-semibold tracking-wide text-muted-foreground">
              <th className="py-2 ps-4 pe-3 text-right text-foreground">
                المعيار
              </th>
              <th className="py-2 px-3 text-right text-foreground">النتيجة</th>
              <th className="py-2 px-3 text-right text-foreground">الوحدة</th>
              <th className="py-2 px-3 text-right text-foreground">المعدل</th>
              <th className="py-2 pe-4 ps-3 text-right text-foreground">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {item.results.map((row, ri) => {
              const isFlagged =
                row.result_flag !== null &&
                row.result_flag !== undefined &&
                row.result_flag !== 'normal'
              return (
                <tr
                  key={row.id ?? `${item.id}-r-${ri}`}
                  className={cn(
                    'border-b border-border/60 last:border-b-0',
                    'hover:bg-muted/40',
                    isFlagged && 'bg-rose-500/8 dark:bg-rose-950/25',
                  )}
                >
                  <td className="py-2 ps-4 pe-3 font-medium text-foreground">
                    {row.field_name}
                  </td>
                  <td className="py-2 px-3 font-mono tabular-nums text-foreground">
                    {formatValue(row.value)}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    {row.unit ?? '—'}
                  </td>
                  <td className="whitespace-pre-line py-2 px-3 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {formatVerifyReferenceDisplayBlock(row)}
                  </td>
                  <td className="py-2 pe-4 ps-3">
                    <VerifyResultFlagBadge flag={row.result_flag} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {item.results.map((row, ri) => (
          <li key={row.id ?? `m-${item.id}-${ri}`} className="space-y-1.5 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-semibold text-foreground">
                {row.field_name}
              </p>
              <VerifyResultFlagBadge flag={row.result_flag} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <p>
                <span className="text-muted-foreground">النتيجة: </span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatValue(row.value)}
                  {row.unit ? (
                    <span className="text-muted-foreground"> {row.unit}</span>
                  ) : null}
                </span>
              </p>
              <p className="text-end">
                <span className="text-muted-foreground">المعدل: </span>
                <span className="whitespace-pre-line font-mono tabular-nums text-muted-foreground">
                  {formatVerifyReferenceDisplayBlock(row)}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
