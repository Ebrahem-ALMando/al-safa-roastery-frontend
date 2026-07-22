import Link from "next/link"
import { ArrowRight, Construction } from "lucide-react"
import { BrandLogo } from "@/components/branding/BrandLogo"
import { Button } from "@/components/ui/button"
import { BRAND_NAME_AR } from "@/lib/brand"

interface ComingSoonViewProps {
  title: string
  description?: string
}

export function ComingSoonView({ title, description }: ComingSoonViewProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center" dir="rtl">
      <BrandLogo variant="login" />
      <div className="max-w-lg space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-700">
          <Construction className="size-6" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description ??
            `هذا القسم قيد التطوير ضمن نظام ${BRAND_NAME_AR} وسيتوفر في التحديث القادم.`}
        </p>
      </div>
      <Button asChild variant="outline" className="gap-2 rounded-xl">
        <Link href="/dashboard">
          <ArrowRight className="size-4" />
          العودة إلى لوحة التحكم
        </Link>
      </Button>
    </div>
  )
}
