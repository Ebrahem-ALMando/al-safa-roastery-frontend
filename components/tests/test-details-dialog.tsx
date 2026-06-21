"use client"

import {
  Activity,
  BadgeCheck,
  Beaker,
  CalendarClock,
  CircleDollarSign,
  ClipboardCopy,
  FileText,
  FlaskConical,
  Hash,
  Info,
  Layers,
  ListChecks,
  Sparkles,
  Tag,
  TestTubes,
} from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  DEFAULT_SECTION_KEY,
  getFieldTypeInputBadgeLabel,
  getTestTemplateBadgeLabel,
  getTestTemplateType,
  groupTestFieldsBySection,
  isTemplateTest,
  shouldShowGroupedFields,
  useTestDetails,
  type Test,
  type TestField,
} from "@/features/tests"
import {
  describeReferenceRowMeta,
  formatTestDetailsReferenceRangeDisplay,
} from "@/lib/reference-range-format"
import { getTestIcon } from "./tests-helpers"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  testId: number | null
}

function StatBlock({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  accent?: "primary" | "success" | "warning" | "info"
}) {
  const accentClass =
    accent === "success"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : accent === "warning"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : accent === "info"
          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : "bg-primary/10 text-primary"
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-3 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            accentClass
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
          <div className="truncate text-sm font-semibold leading-tight">{value}</div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <h4 className="text-sm font-semibold leading-tight">{title}</h4>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  )
}

function FieldCard({
  field,
  index,
  showLabPolicyHint = false,
}: {
  field: TestField
  index: number
  showLabPolicyHint?: boolean
}) {
  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg in-data-[state=active]:animate-in in-data-[state=active]:fade-in-0 in-data-[state=active]:slide-in-from-bottom-2 in-data-[state=active]:duration-500"
    >
      <span className="pointer-events-none absolute inset-y-0 right-0 w-1 rounded-l-full bg-primary/30 transition-all duration-300 group-hover:bg-primary group-hover:w-1.5" />
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-lg px-2 py-1 text-xs font-medium">
            {field.name}
          </Badge>
          {field.code ? (
            <Badge variant="outline" className="rounded-lg font-mono text-[11px]" dir="ltr">
              <Hash className="me-1 size-3" />
              {field.code}
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-lg text-[11px]">
            <Beaker className="me-1 size-3" />
            {getFieldTypeInputBadgeLabel(field)}
          </Badge>
          <Badge
            className={cn(
              "rounded-lg text-[11px]",
              field.is_required
                ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20"
                : "bg-muted text-muted-foreground hover:bg-muted"
            )}
          >
            <BadgeCheck className="me-1 size-3" />
            {field.is_required ? "مطلوب" : "اختياري"}
          </Badge>
          <Badge variant="outline" className="rounded-lg text-[11px]" dir="ltr">
          {field.reference_range_mode === "advanced" ? "نطاقات متقدمة" : "نطاق مبسّط"}
        </Badge>
      
        <Badge
          className={cn(
            "rounded-lg text-[11px]",
            field.is_active
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Activity className="me-1 size-3" />
          {field.is_active ? "نشط" : "موقوف"}
        </Badge>
        </div>
   
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="mb-1 text-[11px] text-muted-foreground">وحدة القياس</p>
          <p className="font-mono text-sm font-medium">{field.unit || "—"}</p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="mb-1 text-[11px] text-muted-foreground">الترتيب</p>
          <p className="font-mono text-sm font-medium">{field.sort_order}</p>
        </div>
      </div>
      <div className="mt-2.5">
        <div className="rounded-xl bg-muted/40 p-3 space-y-2">
          <div>
            <p className="mb-1 text-[11px] text-muted-foreground">النطاقات المرجعية</p>
            {showLabPolicyHint ? (
              <p className="text-[10px] leading-snug text-muted-foreground/80">
                قد تُحدد بعض القيم حسب سياسة المختبر
              </p>
            ) : null}
          </div>
          <ul className="space-y-2">
            {(field.reference_ranges ?? [])
              .filter((r) => r.is_active !== false)
              .map((r, ri) => {
                const rangeDisplay = formatTestDetailsReferenceRangeDisplay(r, field.unit ?? null)
                const isEmptyRange = rangeDisplay === "لا يوجد نطاق مرجعي محدد"

                return (
                <li
                  key={`${r.id}-${ri}`}
                  className="rounded-lg border border-border/50 bg-background/80 px-2.5 py-2 text-[12px] leading-snug"
                >
                  <p className="mb-1 text-right font-sans text-[10px] text-muted-foreground">
                    {describeReferenceRowMeta(r)}
                  </p>
                  <p
                    className={cn(
                      "font-medium text-right",
                      isEmptyRange ? "font-sans text-muted-foreground" : "font-mono",
                    )}
                    dir={isEmptyRange ? "rtl" : "ltr"}
                  >
                    {rangeDisplay}
                  </p>
                  {r.interpretation_text?.trim() ? (
                    <p className="mt-1 text-right font-sans text-[10px] text-muted-foreground/90">
                      {r.interpretation_text.trim()}
                    </p>
                  ) : null}
                </li>
              )})}
            {(field.reference_ranges ?? []).filter((r) => r.is_active !== false).length === 0 ? (
              <li className="font-sans text-sm text-muted-foreground">— لا صفوف مرجعية —</li>
            ) : null}
          </ul>
        </div>
      </div>
      {field.field_type === "select" && field.select_options ? (
        <>
          <Separator className="my-3" />
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">خيارات القائمة</p>
            <div className="flex flex-wrap gap-1.5">
              {String(field.select_options)
                .split(/[,\n]/)
                .map((opt) => opt.trim())
                .filter(Boolean)
                .map((opt) => (
                  <Badge key={opt} variant="outline" className="rounded-md text-[11px]">
                    {opt}
                  </Badge>
                ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function FieldsBySection({ test }: { test: Test }) {
  const groups = groupTestFieldsBySection(test.fields, {
    preferArabic: true,
    templateType: getTestTemplateType(test),
  })

  let fieldIndex = 0

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section
          key={group.sectionKey}
          className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20"
        >
          <div className="border-b border-border/50 bg-card/80 px-4 py-3 sm:px-5">
            <h5 className="text-sm font-semibold leading-tight">{group.label}</h5>
            {group.sectionKey !== DEFAULT_SECTION_KEY ? (
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground" dir="ltr">
                {group.sectionKey}
              </p>
            ) : null}
          </div>
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {group.fields.map((field) => {
              const index = fieldIndex
              fieldIndex += 1

              return (
                <FieldCard
                  key={field.id}
                  field={field}
                  index={index}
                  showLabPolicyHint={isTemplateTest(test)}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export function TestDetailsDialog({ open, onOpenChange, testId }: Props) {
  const { test, isLoading, error } = useTestDetails({
    id: testId,
    enabled: open,
  })

  const Icon = test ? getTestIcon(test.icon_name) : TestTubes
  const requiredFieldsCount = test?.fields.filter((f) => f.is_required).length ?? 0
  const minPrice = test?.prices.length
    ? Math.min(...test.prices.map((p) => Number(p.amount) || 0))
    : null
  const maxPrice = test?.prices.length
    ? Math.max(...test.prices.map((p) => Number(p.amount) || 0))
    : null

  const handleCopyJson = (data: Test | null) => {
    if (!data) return
    void navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => toast.success("تم نسخ بيانات الفحص بصيغة JSON"))
      .catch(() => toast.error("تعذر النسخ"))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="flex min-h-0 max-h-[94vh] w-[98vw] max-w-[1180px] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-[90vw] lg:max-w-[700px] xl:max-w-[800px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        showCloseButton
      >
        <DialogHeader className="relative shrink-0 space-y-0 overflow-hidden border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
          <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative shrink-0">
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-xl" />
                <div className="flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-md sm:size-20">
                  {isLoading ? (
                    <Skeleton className="size-10 rounded-xl" />
                  ) : (
                    <Icon className="size-8 sm:size-10" strokeWidth={1.5} />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-xl font-bold leading-tight sm:text-2xl">
                    {isLoading ? (
                      <Skeleton className="h-7 w-48" />
                    ) : (
                      test?.name ?? "تفاصيل الفحص"
                    )}
                  </DialogTitle>
                  {test ? (
                    <>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 rounded-full px-2.5 py-0.5",
                          getTestTemplateType(test) !== "standard"
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        <Layers className="size-3" />
                        {getTestTemplateBadgeLabel(test)}
                      </Badge>
                      <Badge
                        className={cn(
                          "gap-1 rounded-full px-2.5 py-0.5",
                          test.is_active
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Activity className="size-3" />
                        {test.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </>
                  ) : null}
                </div>
                <DialogDescription className="text-sm">
                  عرض شامل لبيانات الفحص — المعلومات الأساسية، حقول النتائج، والتسعيرات.
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-1.5">
                  {test ? (
                    <>
                      <Badge variant="outline" className="gap-1 rounded-lg font-mono" dir="ltr">
                        <Hash className="size-3" />
                        {test.code}
                      </Badge>
                      {test.category?.name ? (
                        <Badge variant="secondary" className="gap-1 rounded-lg">
                          <Tag className="size-3" />
                          {test.category.name}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" className="rounded-lg font-mono" dir="ltr">
                        ID: {test.id}
                      </Badge>
                    </>
                  ) : isLoading ? (
                    <>
                      <Skeleton className="h-5 w-20 rounded-lg" />
                      <Skeleton className="h-5 w-24 rounded-lg" />
                    </>
                  ) : null}
                </div>
              </div>

              {test ? (
                <div className="hidden shrink-0 sm:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={() => handleCopyJson(test)}
                  >
                    <ClipboardCopy className="size-4" />
                    نسخ JSON
                  </Button>
                </div>
              ) : null}
            </div>

            {test ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatBlock
                  icon={ListChecks}
                  label="عدد الحقول"
                  value={
                    <span>
                      {test.fields.length}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        ({requiredFieldsCount} مطلوبة)
                      </span>
                    </span>
                  }
                  accent="primary"
                />
                <StatBlock
                  icon={CircleDollarSign}
                  label="عدد التسعيرات"
                  value={`${test.prices.length}`}
                  accent="success"
                />
                <StatBlock
                  icon={Sparkles}
                  label="نطاق السعر"
                  value={
                    minPrice != null && maxPrice != null ? (
                      <span dir="ltr" className="font-mono text-[11px]">
                        {minPrice === maxPrice ? minPrice : `${minPrice} – ${maxPrice}`}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                  accent="info"
                />
                <StatBlock
                  icon={Layers}
                  label=" الأيقونة"
                  value={
                    <span className="font-mono text-[11px] flex items-center gap-2" dir="ltr">
                      {test.icon_name || "—"}
                      <Icon className="size-4 sm:size-6" strokeWidth={3} />
                    </span>
                  }
                  accent="warning"
                />
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
          <div className="p-5 pb-8 sm:p-6 sm:pb-10">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                  <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <Info className="size-6" />
                  </span>
                  <p className="font-semibold text-destructive">تعذر تحميل تفاصيل الفحص</p>
                  <p className="text-sm text-muted-foreground">حاول مرة أخرى لاحقاً.</p>
                </div>
              ) : !test ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 p-10 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                    <FlaskConical className="size-6" />
                  </span>
                  <p className="font-semibold">لا توجد بيانات</p>
                  <p className="text-sm text-muted-foreground">لم يتم العثور على هذا الفحص.</p>
                </div>
              ) : (
                <Tabs dir="rtl" defaultValue="basic" className="space-y-5">
                  <TabsList className="sticky top-0 z-10 grid h-auto w-full grid-cols-2 gap-1.5 rounded-2xl border border-border/60 bg-card/80 p-1.5 backdrop-blur supports-backdrop-filter:bg-card/70 sm:grid-cols-4">
                    <TabsTrigger
                      value="basic"
                      className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm"
                    >
                      <Info className="size-4" />
                      المعلومات الأساسية
                    </TabsTrigger>
                    <TabsTrigger
                      value="results"
                      className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm"
                    >
                      <ListChecks className="size-4" />
                      النتائج
                      <Badge variant="secondary" className="ms-1 h-5 rounded-full px-1.5 text-[10px]">
                        {test.fields.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="prices"
                      className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm"
                    >
                      <CircleDollarSign className="size-4" />
                      الأسعار
                      <Badge variant="secondary" className="ms-1 h-5 rounded-full px-1.5 text-[10px]">
                        {test.prices.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="extra"
                      className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm"
                    >
                      <Layers className="size-4" />
                      معلومات إضافية
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="basic"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <SectionTitle
                      icon={Info}
                      title="المعلومات الأساسية"
                      hint="بيانات الهوية والتصنيف للفحص"
                    />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <StatBlock icon={FlaskConical} label="اسم الفحص" value={test.name} />
                      <StatBlock
                        icon={Hash}
                        label="رمز الفحص"
                        value={
                          <span className="font-mono" dir="ltr">
                            {test.code}
                          </span>
                        }
                      />
                      <StatBlock
                        icon={Tag}
                        label="التصنيف"
                        value={test.category?.name ?? "—"}
                        accent="info"
                      />
                      <StatBlock
                        icon={Activity}
                        label="الحالة"
                        value={test.is_active ? "نشط" : "غير نشط"}
                        accent={test.is_active ? "success" : "warning"}
                      />
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <SectionTitle
                        icon={FileText}
                        title="ملاحظات"
                        hint="معلومات إضافية حول الفحص"
                      />
                      <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm leading-7 text-foreground/90">
                        {test.notes?.trim() || "— لا توجد ملاحظات —"}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="results"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <SectionTitle
                        icon={ListChecks}
                        title="حقول النتائج"
                        hint="القيم القابلة للإدخال أثناء تنفيذ الفحص"
                      />
                      <Badge variant="outline" className="rounded-full px-3">
                        {test.fields.length} حقل
                      </Badge>
                    </div>
                    {test.fields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-10 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                          <ListChecks className="size-6" />
                        </span>
                        <p className="font-semibold">لا توجد حقول نتائج</p>
                        <p className="text-sm text-muted-foreground">
                          أضف حقولاً للفحص من خلال شاشة التعديل.
                        </p>
                      </div>
                    ) : shouldShowGroupedFields(test) ? (
                      <FieldsBySection test={test} />
                    ) : (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {test.fields.map((field, i) => (
                          <FieldCard
                            key={field.id}
                            field={field}
                            index={i}
                            showLabPolicyHint={isTemplateTest(test)}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="prices"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <SectionTitle
                        icon={CircleDollarSign}
                        title="التسعيرات"
                        hint="أسعار الفحص بحسب العملات المتاحة"
                      />
                      <Badge variant="outline" className="rounded-full px-3">
                        {test.prices.length} تسعيرة
                      </Badge>
                    </div>
                    {test.prices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-10 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                          <CircleDollarSign className="size-6" />
                        </span>
                        <p className="font-semibold">لا توجد تسعيرات</p>
                        <p className="text-sm text-muted-foreground">أضف تسعيرات من شاشة التعديل.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {test.prices.map((price, i) => (
                          <div
                            key={price.id}
                            style={{ animationDelay: `${i * 60}ms` }}
                            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg in-data-[state=active]:animate-in in-data-[state=active]:fade-in-0 in-data-[state=active]:slide-in-from-bottom-2 in-data-[state=active]:duration-500"
                          >
                            <div className="pointer-events-none absolute -top-10 -left-8 size-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:bg-primary/20" />
                            <div className="relative flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">العملة</span>
                              <Badge variant="outline" className="rounded-lg font-mono" dir="ltr">
                                {price.currency_code}
                              </Badge>
                            </div>
                            <p
                              className="relative mt-3 flex items-baseline gap-1 font-mono text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary"
                              dir="ltr"
                            >
                              <span>{price.amount}</span>
                              <span className="text-xs font-medium text-muted-foreground">
                                {price.currency_code}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="extra"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <SectionTitle
                      icon={Layers}
                      title="معلومات إضافية"
                      hint="تفاصيل تقنية للفحص في النظام"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <StatBlock
                        icon={Hash}
                        label="معرّف التصنيف"
                        value={
                          <span className="font-mono" dir="ltr">
                            {test.category_id}
                          </span>
                        }
                      />
                      <StatBlock
                        icon={CalendarClock}
                        label="إجمالي الحقول المطلوبة"
                        value={
                          <span className="font-mono" dir="ltr">
                            {requiredFieldsCount} / {test.fields.length}
                          </span>
                        }
                        accent="warning"
                      />
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <SectionTitle
                        icon={Sparkles}
                        title="ملخص سريع"
                        hint="مؤشرات سريعة عن الفحص"
                      />
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">حقول رقمية</p>
                          <p className="mt-1 font-mono text-lg font-semibold">
                            {test.fields.filter((f) => f.field_type === "number").length}
                          </p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">حقول قائمة</p>
                          <p className="mt-1 font-mono text-lg font-semibold">
                            {test.fields.filter((f) => f.field_type === "select").length}
                          </p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">حقول نصية</p>
                          <p className="mt-1 font-mono text-lg font-semibold">
                            {test.fields.filter((f) => f.field_type === "text").length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
