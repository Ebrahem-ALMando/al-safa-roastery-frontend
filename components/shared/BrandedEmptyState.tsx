import { Coffee } from "lucide-react"
import { BrandLogo } from "@/components/branding/BrandLogo"
import { BRAND_NAME_AR } from "@/lib/brand"
import { cn } from "@/lib/utils"

interface BrandedEmptyStateProps {
  title?: string
  description?: string
  className?: string
  icon?: React.ReactNode
}

export function BrandedEmptyState({
  title = "لا توجد بيانات حالياً",
  description = `ابدأ بإضافة أول سجل في ${BRAND_NAME_AR}`,
  className,
  icon,
}: BrandedEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center",
        className
      )}
      dir="rtl"
    >
      {icon ?? (
        <div className="relative">
          <BrandLogo variant="loading" className="opacity-90" />
          <Coffee className="absolute -bottom-1 -left-1 size-5 text-amber-600" aria-hidden />
        </div>
      )}
      <div className="max-w-sm space-y-2">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
