import Image from "next/image"
import { ShieldCheck } from "lucide-react"
import { LAB_LOGO_PATH } from "@/lib/lab-brand"
import { LoginForm } from "@/components/auth/LoginForm"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/[0.07] via-background to-secondary/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 -top-32 h-[min(100vw,32rem)] w-[min(100vw,32rem)] rounded-full bg-primary/18 blur-3xl transition-opacity duration-700 dark:bg-primary/12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-32 h-72 w-72 rounded-full bg-chart-2/15 blur-3xl dark:bg-chart-2/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-size-[2.5rem_2.5rem] bg-[radial-gradient(circle_at_center,var(--border)_0.5px,transparent_0.6px)] opacity-40 dark:opacity-25"
        aria-hidden
      />

      <ThemeToggle />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <header className="mb-10 text-center">
            <div
              className="mx-auto mb-6 flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-white p-2 shadow-md ring-1 ring-primary/5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:bg-white"
            >
              <Image
                src={LAB_LOGO_PATH}
                alt=""
                width={72}
                height={72}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              نظام إدارة محمصة الصفا
            </h1>
            <p className="mt-2 text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              تسجيل الدخول إلى نظام محمصة الصفا
            </p>
          </header>

          <Card className="border-border/50 bg-card/90 shadow-2xl ring-1 ring-border/40 backdrop-blur-xl transition-shadow duration-300 ease-out hover:shadow-[0_1.5rem_3rem_-0.75rem_rgba(0,0,0,0.1)] dark:bg-card/80 dark:ring-border/30">
            <CardHeader className="space-y-2 pb-2 text-right">
              <CardTitle className="text-xl font-semibold">تسجيل الدخول</CardTitle>
              <CardDescription className="text-pretty text-sm">
                أدخل اسم المستخدم وكلمة المرور المعتمدة لدى المختبر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm redirectTo={from} />
            </CardContent>
          </Card>

          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <ShieldCheck
              className="size-3.5 shrink-0 text-primary/80"
              strokeWidth={2}
              aria-hidden
            />
            <span>اتصال آمن — الجلسة محمية عبر ملفات تعريف ارتباط httpOnly</span>
          </div>
        </div>
      </div>
    </div>
  )
}
