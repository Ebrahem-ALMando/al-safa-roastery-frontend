"use client"

import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react"
import { BrandLogo } from "@/components/branding/BrandLogo"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function DashboardWelcomeHero() {
  return (
    <section
      aria-labelledby="dashboard-welcome-title"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm",
        "bg-linear-to-bl from-primary/[0.06] via-white to-amber-50/40"
      )}
    >
      <div
        className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-10 size-48 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_45%)]"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-6 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:gap-8 lg:p-7">
        <div className="order-2 w-full space-y-4 text-center md:order-1 md:flex-1 md:text-right">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-700"
            >
              <CheckCircle2 className="size-3.5" aria-hidden />
              النظام يعمل بشكل طبيعي
            </Badge>
          </div>

          <div className="space-y-2">
            <h2
              id="dashboard-welcome-title"
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              مرحباً بك في محمصة الصفا
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base md:mx-0">
              راقب المبيعات والمخزون والصندوق والإنتاج من مكان واحد.
            </p>
          </div>

          <dl className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:text-sm md:justify-start">
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/70 px-3 py-1.5">
              <Clock3 className="size-3.5 text-primary" aria-hidden />
              <dt className="sr-only">آخر تحديث</dt>
              <dd>
                آخر تحديث: <span className="font-medium text-foreground">الآن</span>
              </dd>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/70 px-3 py-1.5">
              <CalendarDays className="size-3.5 text-primary" aria-hidden />
              <dt className="sr-only">الفترة الحالية</dt>
              <dd>
                الفترة الحالية: <span className="font-medium text-foreground">هذا الشهر</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="order-1 flex shrink-0 justify-center md:order-2">
          <div
            className={cn(
              "relative motion-reduce:animate-none",
              "animate-[hero-float_6s_ease-in-out_infinite]"
            )}
          >
            <div
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl motion-reduce:hidden"
              aria-hidden
            />
            <div
              className={cn(
                "relative overflow-hidden rounded-full",
                "before:pointer-events-none before:absolute before:inset-0 before:z-10",
                "before:bg-linear-to-tr before:from-transparent before:via-white/40 before:to-transparent",
                "before:opacity-0 before:transition-opacity before:duration-700",
                "hover:before:opacity-100 motion-reduce:before:hidden"
              )}
            >
              <BrandLogo variant="hero" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
