import { BrandLogo } from "@/components/branding/BrandLogo"
import { BRAND_NAME_AR } from "@/lib/brand"

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 page-enter">
      <BrandLogo variant="loading" priority />
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-foreground">جاري التحميل...</p>
        <p className="text-xs text-muted-foreground">{BRAND_NAME_AR}</p>
      </div>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  )
}
