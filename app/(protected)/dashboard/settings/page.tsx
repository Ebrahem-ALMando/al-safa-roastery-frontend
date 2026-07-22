"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Bell,
  Building,
  Moon,
  Palette,
  Sparkles,
  Sun,
  User,
  Settings2,
} from "lucide-react"
import { ProfileView } from "@/components/profile/ProfileView"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  defaultLabProfile,
  readLabProfile,
  readMotionEnabled,
  readNotificationPrefs,
  readSidebarCollapsed,
  writeLabProfile,
  writeMotionEnabled,
  writeNotificationPrefs,
  writeSidebarCollapsed,
  type LabProfile,
  type NotificationPrefs,
} from "@/lib/dashboard-prefs"

const rtlInput =
  "text-end placeholder:text-end [direction:rtl]"

const tabContentAnim =
  "motion-reduce:animate-none animate-in fade-in-0 slide-in-from-bottom-1 duration-200"

function SettingRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <div className="min-w-0 space-y-1 text-right">
        <p className="font-medium leading-snug">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex shrink-0 justify-end sm:justify-start">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="lab-preserve-motion scale-110 data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  const [lab, setLab] = React.useState<LabProfile>(defaultLabProfile)
  const [notifications, setNotifications] = React.useState<NotificationPrefs>(
    readNotificationPrefs()
  )
  const [motionOn, setMotionOn] = React.useState(true)
  const [sidebarCollapsedPref, setSidebarCollapsedPref] = React.useState(false)

  const notifToastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  React.useEffect(() => {
    setMounted(true)
    setLab(readLabProfile())
    setNotifications(readNotificationPrefs())
    setMotionOn(readMotionEnabled())
    setSidebarCollapsedPref(readSidebarCollapsed())
  }, [])

  const scheduleNotifSavedToast = React.useCallback(() => {
    if (notifToastTimer.current) clearTimeout(notifToastTimer.current)
    notifToastTimer.current = setTimeout(() => {
      toast.success("تم حفظ إعدادات الإشعارات")
      notifToastTimer.current = null
    }, 450)
  }, [])

  const updateNotifications = React.useCallback(
    (patch: Partial<NotificationPrefs>) => {
      setNotifications((prev) => {
        const next = { ...prev, ...patch }
        writeNotificationPrefs(next)
        scheduleNotifSavedToast()
        return next
      })
    },
    [scheduleNotifSavedToast]
  )

  return (
    <div className="space-y-8" dir="rtl" lang="ar">
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-bl from-primary/[0.07] via-background to-background p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -inset-s-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -inset-e-12 size-40 rounded-full bg-teal-500/10 blur-2xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" aria-hidden />
              تخصيص النظام
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Settings2 className="size-5 text-sky-600 dark:text-sky-400" />
              الإعدادات
           
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground sm:text-base">
              ضبط بيانات الملف الشخصي، المحمصة، الإشعارات والمظهر — التغييرات
              المرتبطة بالشريط الجانبي والحركة تُطبَّق مباشرة على لوحة التحكم.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-6" dir="rtl">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border border-border/50 bg-muted/50 p-1.5 shadow-inner sm:grid-cols-4 lg:inline-flex lg:w-auto lg:gap-1">
       
        <TabsTrigger
            value="account"
            className="gap-2 rounded-xl py-2.5 data-[state=active]:border-sky-500/30 data-[state=active]:bg-sky-50 data-[state=active]:shadow-sm dark:data-[state=active]:bg-sky-950/50"
          >
            <User className="size-4 shrink-0" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger
            value="lab"
            className="gap-2 rounded-xl py-2.5 data-[state=active]:border-teal-500/30 data-[state=active]:bg-teal-50 data-[state=active]:shadow-sm dark:data-[state=active]:bg-teal-950/50"
          >
            <Building className="size-4 shrink-0" />
            المحمصة
          </TabsTrigger>
        
          <TabsTrigger
            value="notifications"
            className="gap-2 rounded-xl py-2.5 data-[state=active]:border-amber-500/30 data-[state=active]:bg-amber-50 data-[state=active]:shadow-sm dark:data-[state=active]:bg-amber-950/50"
          >
            <Bell className="size-4 shrink-0" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="gap-2 rounded-xl py-2.5 data-[state=active]:border-violet-500/30 data-[state=active]:bg-violet-50 data-[state=active]:shadow-sm dark:data-[state=active]:bg-violet-950/50"
          >
            <Palette className="size-4 shrink-0" />
            المظهر
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lab" className="mt-0 outline-none">
          <div className={tabContentAnim}>
            <Card className="overflow-hidden border-border/60 border-e-4 border-e-teal-500/80 shadow-sm">
              <CardHeader className="space-y-1 text-right">
                <CardTitle className="flex items-center  gap-2 text-lg">
                  <Building className="size-5 text-teal-600 dark:text-teal-400" />
                  معلومات المحمصة
                </CardTitle>
                <CardDescription className="text-pretty">
                  البيانات الأساسية التي تظهر في التقارير والوثائق الرسمية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="labName" className="text-right">
                      اسم المحمصة
                    </Label>
                    <Input
                      id="labName"
                      value={lab.labName}
                      onChange={(e) =>
                        setLab((p) => ({ ...p, labName: e.target.value }))
                      }
                      className={cn("h-11 rounded-xl", rtlInput)}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labPhone" className="text-right">
                      رقم الهاتف
                    </Label>
                    <Input
                      id="labPhone"
                      value={lab.labPhone}
                      onChange={(e) =>
                        setLab((p) => ({ ...p, labPhone: e.target.value }))
                      }
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="labEmail" className="text-right">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="labEmail"
                      type="email"
                      value={lab.labEmail}
                      onChange={(e) =>
                        setLab((p) => ({ ...p, labEmail: e.target.value }))
                      }
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labLicense" className="text-right">
                      رقم الترخيص
                    </Label>
                    <Input
                      id="labLicense"
                      value={lab.labLicense}
                      onChange={(e) =>
                        setLab((p) => ({ ...p, labLicense: e.target.value }))
                      }
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labAddress" className="text-right">
                    العنوان
                  </Label>
                  <Input
                    id="labAddress"
                    value={lab.labAddress}
                    onChange={(e) =>
                      setLab((p) => ({ ...p, labAddress: e.target.value }))
                    }
                    className={cn("h-11 rounded-xl", rtlInput)}
                    dir="rtl"
                  />
                </div>
                <Separator />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setLab(defaultLabProfile)
                      writeLabProfile(defaultLabProfile)
                      toast({ title: "تمت إعادة القيم الافتراضية", variant: "default" })
                    }}
                  >
                    استعادة الافتراضي
                  </Button>
                  <Button
                    className="rounded-xl px-6"
                    onClick={() => {
                      writeLabProfile(lab)
                      toast.success("تم حفظ بيانات المحمصة")
                    }}
                  >
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-0 outline-none">
          <div className={tabContentAnim}>
            <ProfileView />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 outline-none">
          <div className={tabContentAnim}>
            <Card className="overflow-hidden border-border/60 border-e-4 border-e-amber-500/80 shadow-sm">
              <CardHeader className="space-y-1 text-right">
                <CardTitle className="flex items-center  gap-2 text-lg">
                  <Bell className="size-5 text-amber-600 dark:text-amber-400" />
                  إعدادات الإشعارات
                </CardTitle>
                <CardDescription>
                  يُحفظ تلقائياً على هذا الجهاز — يمكنك تفعيل أو إيقاف كل نوع
                  على حدة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <SettingRow
                  title="طلبات جديدة"
                  description="إشعار عند وصول طلب تحليل جديد"
                  checked={notifications.newOrders}
                  onCheckedChange={(v) =>
                    updateNotifications({ newOrders: v })
                  }
                />
                <SettingRow
                  title="نتائج غير طبيعية"
                  description="تنبيه عند وجود نتائج خارج المعدل الطبيعي"
                  checked={notifications.abnormal}
                  onCheckedChange={(v) =>
                    updateNotifications({ abnormal: v })
                  }
                />
                <SettingRow
                  title="تقارير جاهزة"
                  description="إشعار عند جاهزية تقرير للطباعة أو الإرسال"
                  checked={notifications.reportsReady}
                  onCheckedChange={(v) =>
                    updateNotifications({ reportsReady: v })
                  }
                />
                <SettingRow
                  title="تحديثات النظام"
                  description="إشعارات حول التحديثات والصيانة المجدولة"
                  checked={notifications.systemUpdates}
                  onCheckedChange={(v) =>
                    updateNotifications({ systemUpdates: v })
                  }
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0 outline-none">
          <div className={tabContentAnim}>
            <Card className="overflow-hidden border-border/60 border-e-4 border-e-violet-500/80 shadow-sm">
              <CardHeader className="space-y-1 text-right">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="size-5 text-violet-600 dark:text-violet-400" />
                  المظهر والعرض
                </CardTitle>
                <CardDescription>
                  الوضع اللوني، الحركات، والشريط الجانبي — يُطبَّق فوراً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-2 text-right sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">الوضع اللوني</p>
                      <p className="text-sm text-muted-foreground">
                        اختر فاتحاً أو داكناً — يتكامل مع إعدادات المتصفح عند
                        التفعيل من النظام
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant={mounted && theme === "light" ? "default" : "outline"}
                      size="sm"
                      className="gap-2 rounded-xl"
                      disabled={!mounted}
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="size-4" />
                      فاتح
                    </Button>
                    <Button
                      type="button"
                      variant={mounted && theme === "dark" ? "default" : "outline"}
                      size="sm"
                      className="gap-2 rounded-xl"
                      disabled={!mounted}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="size-4" />
                      داكن
                    </Button>
                    <Button
                      type="button"
                      variant={mounted && theme === "system" ? "default" : "outline"}
                      size="sm"
                      className="gap-2 rounded-xl"
                      disabled={!mounted}
                      onClick={() => setTheme("system")}
                    >
                      تلقائي
                    </Button>
                  </div>
                  {mounted && (
                    <p className="mt-3 text-xs text-muted-foreground text-right">
                      العرض الحالي:{" "}
                      <span className="font-medium text-foreground">
                        {resolvedTheme === "dark" ? "داكن" : "فاتح"}
                      </span>
                      {theme === "system" ? " (حسب النظام)" : ""}
                    </p>
                  )}
                </div>

                <SettingRow
                  title="تأثيرات الحركة والانتقال"
                  description="عند الإيقاف تُختصر الحركات في لوحة التحكم لتصفح أخف"
                  checked={motionOn}
                  onCheckedChange={(v) => {
                    setMotionOn(v)
                    writeMotionEnabled(v)
                    toast.success(
                      v ? "تم تفعيل الحركات" : "تم تقليل الحركات في الواجهة"
                    )
                  }}
                />

                <SettingRow
                  title="شريط جانبي مصغّر"
                  description="يبدأ الشريط الجانبي مطوياً عند فتح لوحة التحكم — يمكن توسيعه في أي وقت"
                  checked={sidebarCollapsedPref}
                  onCheckedChange={(v) => {
                    setSidebarCollapsedPref(v)
                    writeSidebarCollapsed(v)
                    toast.success(
                      v
                        ? "تم تعيين الشريط الجانبي مصغّراً افتراضياً"
                        : "تم تعيين الشريط الجانبي موسّعاً افتراضياً"
                    )
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
