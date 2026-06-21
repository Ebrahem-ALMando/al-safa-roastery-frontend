"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  Baby,
  BadgeCheck,
  Cake,
  CalendarClock,
  ChevronLeft,
  ClipboardList,
  FileText,
  FlaskConical,
  Hash,
  Info,
  Layers,
  ListChecks,
  Loader2,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Patient } from "@/features/patients"
import { usePatient } from "@/features/patients"
import { useOrders } from "@/features/orders"
import { useOrdersTestCatalogEnrichment } from "@/features/results/hooks/useOrdersTestCatalogEnrichment"
import { genderLabelAr, SectionTitle, StatBlock } from "@/components/orders/order-detail-primitives"
import { PatientDetailOrdersTab } from "@/components/patients/patient-detail/patient-detail-orders-tab"
import { PatientDetailResultsTab } from "@/components/patients/patient-detail/patient-detail-results-tab"
import {
  collectFlatData,
  parsePatientDetailTab,
  type FlatAttachment,
  type PatientDetailTab,
} from "@/components/patients/patient-detail/patient-detail-data"

function formatArDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
}

/** عتبة البلوغ لعرض «بالغ» مقابل «طفل» في الواجهة */
const ADULT_AGE_YEARS = 18

function computeAgeYearsFromDob(dateOfBirth: string | null): number | null {
  if (!dateOfBirth?.trim()) return null
  const birth = new Date(dateOfBirth)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years -= 1
  }
  return years >= 0 ? years : null
}

function adultOrChildLabelAr(ageYears: number | null): { label: string; isChild: boolean | null } {
  if (ageYears === null) return { label: "—", isChild: null }
  if (ageYears >= ADULT_AGE_YEARS) return { label: "بالغ", isChild: false }
  return { label: "طفل", isChild: true }
}

const patientPageStickyBar =
  "sticky top-0 z-20 shrink-0 border-b border-border/60 bg-background/95 pt-1 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/90"

function PatientHero({
  patient,
  ordersCount,
  isLoadingOrders,
}: {
  patient: Patient
  ordersCount: number
  isLoadingOrders: boolean
}) {
  const ageYears = React.useMemo(
    () => computeAgeYearsFromDob(patient.date_of_birth),
    [patient.date_of_birth]
  )
  const ageCategory = adultOrChildLabelAr(ageYears)

  const activeBadge = patient.is_active ? (
    <Badge className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100">
      <Activity className="size-3" />
      نشط
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 rounded-full">
      غير نشط
    </Badge>
  )

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-bl from-primary/10 via-primary/5 to-transparent shadow-sm">
      <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative shrink-0">
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-xl" />
            <Avatar className="size-16 border border-primary/20 shadow-md ring-2 ring-primary/15 sm:size-20">
              <AvatarFallback className="rounded-3xl bg-card text-lg font-bold text-primary sm:text-xl">
                {initials(patient.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold leading-tight sm:text-2xl">{patient.full_name}</h1>
              {activeBadge}
            </div>
            <p className="text-sm text-muted-foreground">
              ملف المريض والطلبات والنتائج — نفس أسلوب بطاقة تفاصيل الطلب.
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="gap-1 rounded-lg font-mono" dir="ltr">
                <Hash className="size-3" />
                ID: {patient.id}
              </Badge>
              <Badge variant="secondary" className="gap-1 rounded-lg font-mono" dir="ltr">
                {patient.patient_number?.trim() || "—"}
              </Badge>
              {ageYears != null ? (
                <Badge variant="outline" className="gap-1 rounded-lg border-primary/25 bg-primary/5 text-primary">
                  <Cake className="size-3" />
                  {ageYears} سنة
                </Badge>
              ) : null}
              {ageCategory.isChild != null ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 rounded-lg",
                    ageCategory.isChild
                      ? "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-100"
                      : "border-violet-500/30 bg-violet-500/10 text-violet-900 dark:text-violet-100"
                  )}
                >
                  {ageCategory.isChild ? <Baby className="size-3" /> : <UserRound className="size-3" />}
                  {ageCategory.label}
                </Badge>
              ) : null}
              <Badge variant="outline" className="gap-1 rounded-lg">
                <ListChecks className="size-3" />
                {isLoadingOrders ? "…" : `${ordersCount}`} طلب
              </Badge>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
            <Button asChild className="gap-2 rounded-xl shadow-sm">
              <Link href={`/dashboard/orders/new?patient=${patient.id}`}>
                <Plus className="size-4" />
                إضافة طلب للمريض
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 rounded-xl">
              <Link href="/dashboard/patients">
                <ChevronLeft className="size-4" />
                قائمة المرضى
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatBlock icon={UserRound} label="الجنس" value={genderLabelAr(patient.gender)} accent="info" />
          <StatBlock
            icon={CalendarClock}
            label="تاريخ الميلاد"
            value={patient.date_of_birth ? formatArDate(patient.date_of_birth) : "—"}
            accent="success"
          />
          <StatBlock
            icon={Cake}
            label="العمر"
            value={ageYears != null ? `${ageYears} سنة` : "—"}
            accent="primary"
          />
          <StatBlock
            icon={ageCategory.isChild === true ? Baby : UserRound}
            label="الفئة العمرية"
            value={ageCategory.label}
            accent={ageCategory.isChild === true ? "info" : ageCategory.isChild === false ? "warning" : undefined}
          />
          <StatBlock
            icon={Phone}
            label="الهاتف"
            value={<span dir="ltr">{patient.phone?.trim() || "—"}</span>}
            accent="primary"
          />
          <StatBlock icon={Mail} label="البريد" value={patient.email?.trim() || "—"} accent="warning" />
        </div>
      </div>
    </div>
  )
}

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const raw = params?.id
  const patientIdNum =
    typeof raw === "string" && raw.trim() !== "" ? Number.parseInt(raw, 10) : NaN
  const patientId = Number.isFinite(patientIdNum) && patientIdNum > 0 ? patientIdNum : null

  const activeTab = parsePatientDetailTab(searchParams.get("tab"))

  const setActiveTab = React.useCallback(
    (tab: PatientDetailTab) => {
      const next = new URLSearchParams(searchParams.toString())
      if (tab === "overview") {
        next.delete("tab")
      } else {
        next.set("tab", tab)
      }
      if (tab !== "results") next.delete("q")
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const [ordersPage, setOrdersPage] = React.useState(1)

  const { patient, isLoading, error } = usePatient(patientId)

  const { orders, meta, isLoading: ordersLoading, error: ordersError } = useOrders({
    page: ordersPage,
    search: "",
    columnFilters: { patient_id: patientId ?? undefined },
    dateRange: null,
    enabled: patientId != null,
  })

  React.useEffect(() => {
    setOrdersPage(1)
  }, [patientId])

  const { orders: enrichedOrders, catalogsLoading: resultsCatalogsLoading } =
    useOrdersTestCatalogEnrichment(orders)

  const { attachments: flatAttachments, resultRows } = React.useMemo(
    () => collectFlatData(enrichedOrders),
    [enrichedOrders]
  )

  const lastPage = meta?.last_page ?? 1
  const currentPage = meta?.current_page ?? ordersPage

  if (patientId === null) {
    return (
      <div
        className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive"
        dir="rtl"
        lang="ar"
      >
        معرّف المريض غير صالح.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl" lang="ar">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-8">
          <Skeleton className="h-24 w-full max-w-xl rounded-2xl" />
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive"
        dir="rtl"
        lang="ar"
      >
        <p className="flex items-center justify-center gap-2 font-medium">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          تعذّر تحميل بيانات المريض.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div
        className="rounded-2xl border border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground"
        dir="rtl"
        lang="ar"
      >
        لا يوجد مريض بهذا المعرف.
      </div>
    )
  }

  const medicalHistoryTrimmed =
    typeof patient.medical_history === "string" ? patient.medical_history.trim() : ""

  const ordersCount = meta?.total ?? orders.length

  return (
    <div className="space-y-6 pb-10" dir="rtl" lang="ar">
      <PatientHero patient={patient} ordersCount={ordersCount} isLoadingOrders={ordersLoading} />

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/40 shadow-sm">
        <Tabs
          dir="rtl"
          value={activeTab}
          onValueChange={(value) => setActiveTab(parsePatientDetailTab(value))}
          className="flex flex-col gap-0"
        >
          <div className={patientPageStickyBar}>
            <div className="border-b border-border/50 px-4 pb-3 pt-3 sm:px-6">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 rounded-2xl border border-border/60 bg-card/80 p-1.5 sm:grid-cols-5">
                <TabsTrigger
                  value="overview"
                  className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
                >
                  <Info className="size-4" />
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
                >
                  <ClipboardList className="size-4" />
                  الطلبات
                  <Badge variant="secondary" className="ms-1 h-5 rounded-full px-1.5 text-[10px]">
                    {ordersLoading ? "…" : ordersCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
                >
                  <FlaskConical className="size-4" />
                  النتائج
                </TabsTrigger>
                <TabsTrigger
                  value="attachments"
                  className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
                >
                  <Layers className="size-4" />
                  مرفقات
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
                >
                  <FileText className="size-4" />
                  ملاحظات
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="space-y-5 px-4 pb-8 pt-4 sm:px-6">
            <TabsContent
              value="overview"
              className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
            >
              <SectionTitle icon={UserRound} title="البيانات الشخصية" hint="هوية المريض كما في السجل" />
              <div className="rounded-2xl border border-sky-200/50 bg-linear-to-b from-sky-50/80 to-card/90 p-5 shadow-sm dark:border-sky-900/40 dark:from-sky-950/25 dark:to-card">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatBlock icon={BadgeCheck} label="الاسم الكامل" value={patient.full_name} />
                  <StatBlock
                    icon={Hash}
                    label="الرقم الوطني"
                    value={<span dir="ltr">{patient.national_id?.trim() || "—"}</span>}
                  />
                  <StatBlock icon={MapPin} label="العنوان" value={patient.address?.trim() || "—"} />
                  <StatBlock
                    icon={CalendarClock}
                    label="تاريخ الإنشاء"
                    value={formatArDate(patient.created_at)}
                    accent="success"
                  />
                </div>
                <Separator className="my-4 bg-border/60" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatBlock icon={Sparkles} label="آخر تحديث" value={formatArDate(patient.updated_at)} accent="info" />
                  <StatBlock
                    icon={Info}
                    label="ملاحظات عامة"
                    value={patient.notes?.trim() || "—"}
                    valueClassName="text-sm font-medium leading-snug text-muted-foreground"
                  />
                </div>
                {medicalHistoryTrimmed ? (
                  <>
                    <Separator className="my-4 bg-border/60" />
                    <SectionTitle icon={FileText} title="التاريخ المرضي" hint="من ملف المريض" />
                    <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-7 text-foreground/90" dir="auto">
                      {medicalHistoryTrimmed}
                    </p>
                  </>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent
              value="orders"
              className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
            >
              <PatientDetailOrdersTab
                patientId={patient.id}
                orders={orders}
                isLoading={ordersLoading}
                error={ordersError}
                currentPage={currentPage}
                lastPage={lastPage}
                canPrev={currentPage > 1}
                canNext={currentPage < lastPage}
                onPageChange={setOrdersPage}
              />
              </TabsContent>

            <TabsContent
              value="results"
              className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
            >
              <PatientDetailResultsTab
                orders={enrichedOrders}
                resultRows={resultRows}
                metadataLoading={resultsCatalogsLoading}
              />
</TabsContent>

            <TabsContent
              value="attachments"
              className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
            >
              <SectionTitle icon={Paperclip} title="مرفقات النتائج" hint="من الطلبات المعروضة في الصفحة الحالية" />
              {flatAttachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-10 text-center">
                  <Paperclip className="size-8 text-muted-foreground" />
                  <p className="font-semibold">لا توجد مرفقات</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {flatAttachments.map((att) => (
                    <a
                      key={`${att.id}-${att.url}`}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:border-primary/30"
                    >
                      <span className="pointer-events-none absolute inset-y-0 right-0 w-1 rounded-l-full bg-primary/20 transition-colors group-hover:bg-primary/40" />
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                          <FileText className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1 text-start">
                          <p className="truncate font-semibold">{att.file_name}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {att.testName} · {att.fieldName}
                          </p>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground" dir="ltr">
                            {att.orderNumber}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="notes"
              className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
            >
              <SectionTitle icon={FileText} title="ملاحظات الطلبات" hint="من الطلبات في الصفحة الحالية" />
              {orders.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  لا توجد طلبات لعرض ملاحظاتها.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:border-primary/20"
                    >
                      <p className="font-mono text-xs font-semibold text-primary" dir="ltr">
                        {order.order_number}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {order.notes?.trim() || "— لا توجد ملاحظات —"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
