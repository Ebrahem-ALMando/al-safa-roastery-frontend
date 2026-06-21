import { cn } from '@/lib/utils'

type VerifyMetaFieldProps = {
  labelAr: string
  labelEn: string
  value: React.ReactNode
  className?: string
  mono?: boolean
}

export function VerifyMetaField({
  labelAr,
  labelEn,
  value,
  className,
  mono,
}: VerifyMetaFieldProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-md border border-border bg-muted/40 px-2.5 py-2 dark:bg-muted/25',
        className,
      )}
    >
      <p className="truncate text-[10px] font-medium tracking-wide text-muted-foreground">
        <span>{labelAr}</span>
        <span className="mx-1 opacity-50">·</span>
        <span>{labelEn.toUpperCase()}</span>
      </p>
      <p
        className={cn(
          'mt-1 truncate text-[13px] font-semibold text-foreground',
          mono && 'font-mono text-[12px] tabular-nums tracking-tight',
        )}
      >
        {value}
      </p>
    </div>
  )
}
