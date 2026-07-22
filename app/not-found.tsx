import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BrandLogo } from "@/components/branding/BrandLogo"
import { Button } from "@/components/ui/button"
import { BRAND_NAME_AR } from "@/lib/brand"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 text-center page-enter" dir="rtl">
      <BrandLogo variant="login" priority />
      <div className="space-y-2">
        <p className="text-6xl font-bold text-primary/20">404</p>
        <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          لم نتمكن من العثور على الصفحة المطلوبة في نظام {BRAND_NAME_AR}.
        </p>
      </div>
      <Button asChild className="gap-2 rounded-xl">
        <Link href="/dashboard">
          <ArrowRight className="size-4" />
          العودة إلى لوحة التحكم
        </Link>
      </Button>
    </div>
  )
}
