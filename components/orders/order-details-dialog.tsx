"use client"

import {
  Activity,
  BadgeCheck,
  CalendarClock,
  ClipboardCopy,
  ClipboardList,
  FileText,
  FlaskConical,
  Hash,
  Info,
  Layers,
  ListChecks,
  Sparkles,
  Stethoscope,
  UserRound,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useLabOrder } from "@/features/orders"
import type { LabOrder, LabOrderItem, LabOrderPatient } from "@/features/orders"
import { GroupedItemResults } from "@/components/results/result-display/grouped-item-results"
import { useOrderTestCatalogEnrichment } from "@/features/results/hooks/useOrderTestCatalogEnrichment"
import { effectiveResultFlagForDisplay } from "@/components/results/results-helpers"
import {
  formatArDateTime,
  formatOrderItemResultReferenceParts,
  formatResultValue,
  getEntryStatusLabelAr,
  getLabOrderItemStatusLabelAr,
  getOrderStatusClassName,
  getOrderStatusLabel,
  getResultFlagLabelAr,
  getResultFlagRowClassName,
} from "./orders-helpers"
import { ReferenceRangeCell } from "./reference-range-cell"
import { OrderPersonCell } from "./order-person-cell"
import { genderLabelAr, SectionTitle, StatBlock } from "./order-detail-primitives"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number | null
}

function countResults(order: LabOrder): number {
  return order.items.reduce((n, it) => n + (it.results?.length ?? 0), 0)
}

function ItemResultsBlock({ item, index }: { item: LabOrderItem; index: number }) {
  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:border-primary/25"
    >
      <span className="pointer-events-none absolute inset-y-0 right-0 w-1 rounded-l-full bg-primary/25" />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant="secondary" className="max-w-[min(100%,280px)] truncate rounded-lg text-xs font-medium">
            {item.test_name}
          </Badge>
          <Badge variant="outline" className="rounded-lg text-[11px]">
            {getLabOrderItemStatusLabelAr(item.status)}
          </Badge>
          {item.is_abnormal ? (
            <Badge className="rounded-lg border-rose-500/40 bg-rose-500/10 text-[11px] text-rose-800 dark:text-rose-100">
              غير طبيعي
            </Badge>
          ) : null}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
          test_id: {item.test_id}
        </span>
      </div>
      <GroupedItemResults item={item} />
    </div>
  )
}

const orderDetailsStickyBar =
  "sticky top-0 z-20 shrink-0 border-b border-border/60 bg-background/95 pt-1 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/90"

function OrderDetailsDialogHero({
  isLoading,
  order,
  resultsCount,
  orderedAt,
  onCopyJson,
}: {
  isLoading: boolean
  order: LabOrder | null | undefined
  resultsCount: number
  orderedAt: { date: string; time: string }
  onCopyJson: (o: LabOrder) => void
}) {
  return (
    <DialogHeader className="relative space-y-0 overflow-hidden border-b-0 bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
      <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative shrink-0">
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-xl" />
            <div className="flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-md sm:size-20">
              {isLoading ? (
                <Skeleton className="size-10 rounded-xl" />
              ) : (
                <ClipboardList className="size-8 sm:size-10" strokeWidth={1.5} />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-xl font-bold leading-tight sm:text-2xl">
                {isLoading ? <Skeleton className="h-7 w-56" /> : order ? `طلب ${order.order_number}` : "تفاصيل الطلب"}
              </DialogTitle>
              {order ? (
                <Badge variant="outline" className={cn("gap-1 rounded-full px-2.5 py-0.5", getOrderStatusClassName(order.status))}>
                  <Activity className="size-3" />
                  {getOrderStatusLabel(order.status)}
                </Badge>
              ) : null}
            </div>
            <DialogDescription className="text-sm">
              عرض منظّم: المريض، التحاليل، النتائج، والبيانات الإدارية — بنفس أسلوب بطاقة تفاصيل الفحص.
            </DialogDescription>
            <div className="flex flex-wrap items-center gap-1.5">
              {order ? (
                <>
                  <Badge variant="outline" className="gap-1 rounded-lg font-mono" dir="ltr">
                    <Hash className="size-3" />
                    ID: {order.id}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    <ListChecks className="size-3" />
                    {order.items.length} تحليل
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

          {order ? (
            <div className="hidden shrink-0 sm:block">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => onCopyJson(order)}>
                <ClipboardCopy className="size-4" />
                نسخ JSON
              </Button>
            </div>
          ) : null}
        </div>

        {order ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock icon={ListChecks} label="عدد التحاليل" value={`${order.items.length}`} accent="primary" />
            <StatBlock icon={FlaskConical} label="عدد نتائج الحقول" value={`${resultsCount}`} accent="info" />
            <StatBlock icon={CalendarClock} label="تاريخ الطلب" value={<span>{orderedAt.date}</span>} accent="success" />
            <StatBlock
              icon={Stethoscope}
              label="الطبيب"
              valueClassName="min-w-0 text-sm leading-tight"
              value={
                <OrderPersonCell
                  size="sm"
                  name={
                    order.requested_by_user?.name?.trim() ||
                    order.requesting_doctor_name?.trim() ||
                    "—"
                  }
                  secondary={
                    order.requested_by_user?.username?.trim()
                      ? `@${order.requested_by_user.username}`
                      : order.requested_by_user
                        ? order.requested_by_user.role
                        : order.requesting_doctor_name?.trim()
                          ? "طبيب معالج"
                          : "لم يُذكر اسم الطبيب"
                  }
                  avatarUrl={order.requested_by_user?.avatar_url ?? null}
                />
              }
              accent="warning"
            />
          </div>
        ) : null}
      </div>
    </DialogHeader>
  )
}

function PatientDetailCard({ patient }: { patient: LabOrderPatient }) {
  const dob = formatArDateTime(patient.date_of_birth)
  return (
    <div className="rounded-2xl border border-sky-200/50 bg-linear-to-b from-sky-50/80 to-card/90 p-5 shadow-sm dark:border-sky-900/40 dark:from-sky-950/25 dark:to-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1 text-right">
          <p className="text-lg font-bold leading-tight">{patient.full_name}</p>
          <p className="text-sm text-muted-foreground" dir="ltr">
            {patient.patient_number?.trim() || "—"} · {patient.phone?.trim() || "—"}
          </p>
        </div>
        <Badge variant={patient.is_active ? "default" : "secondary"} className="shrink-0 rounded-full">
          {patient.is_active ? "نشط" : "غير نشط"}
        </Badge>
      </div>
      <Separator className="my-4 bg-border/60" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock icon={UserRound} label="الجنس" value={genderLabelAr(patient.gender)} accent="info" />
        <StatBlock icon={CalendarClock} label="تاريخ الميلاد" value={patient.date_of_birth ? dob.date : "—"} />
        <StatBlock icon={Hash} label="معرّف المريض" value={<span dir="ltr">{patient.id}</span>} accent="primary" />
        <StatBlock icon={BadgeCheck} label="رقم الملف" value={patient.patient_number?.trim() || "—"} />
      </div>
    </div>
  )
}

export function OrderDetailsDialog({ open, onOpenChange, orderId }: Props) {
  const { order: rawOrder, isLoading: orderLoading, error } = useLabOrder({
    id: orderId,
    enabled: open && orderId != null,
  })
  const { order, catalogsLoading } = useOrderTestCatalogEnrichment(rawOrder)
  const isLoading = orderLoading || catalogsLoading

  const resultsCount = order ? countResults(order) : 0
  const orderedAt = order ? formatArDateTime(order.ordered_at) : { date: "—", time: "—" }

  const handleCopyJson = (data: LabOrder | null) => {
    if (!data) return
    void navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => toast.success("تم نسخ بيانات الطلب بصيغة JSON"))
      .catch(() => toast.error("تعذر النسخ"))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className="flex min-h-0 max-h-[94vh] w-[min(100vw-1rem,980px)] max-w-[min(100vw-1rem,980px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:max-w-[min(100vw-1.25rem,980px)]"
        showCloseButton
      >
        {order && !isLoading && !error ? (
          <Tabs dir="rtl" defaultValue="basic" className="flex min-h-0 flex-1 flex-col gap-0">
            <div className={cn(orderDetailsStickyBar, "shrink-0")}>
                <OrderDetailsDialogHero
                  isLoading={false}
                  order={order}
                  resultsCount={resultsCount}
                  orderedAt={orderedAt}
                  onCopyJson={handleCopyJson}
                />
                <div className="border-t border-border/50 px-5 pb-3 pt-3 sm:px-6">
                  <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 rounded-2xl border border-border/60 bg-card/80 p-1.5 sm:grid-cols-4">
                    <TabsTrigger value="basic" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                      <Info className="size-4" />
                      الأساسيات
                    </TabsTrigger>
                    <TabsTrigger value="patient" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                      <UserRound className="size-4" />
                      المريض
                    </TabsTrigger>
                    <TabsTrigger value="labs" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                      <FlaskConical className="size-4" />
                      تحاليل ونتائج
                      <Badge variant="secondary" className="ms-1 h-5 rounded-full px-1.5 text-[10px]">
                        {order.items.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="extra" className="gap-1.5 rounded-xl py-2 text-xs font-semibold sm:text-sm">
                      <Layers className="size-4" />
                      إضافي
                    </TabsTrigger>
                  </TabsList>
                </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
              <div className="space-y-5 px-5 pb-8 pt-4 sm:px-6 sm:pb-10">
                <TabsContent
                    value="basic"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <SectionTitle icon={Info} title="معلومات الطلب" hint="الحالة، التواريخ، والطبيب" />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <StatBlock
                        icon={Hash}
                        label="رقم الطلب"
                        value={<span className="font-mono" dir="ltr">{order.order_number}</span>}
                      />
                      <StatBlock icon={Activity} label="الحالة" value={getOrderStatusLabel(order.status)} accent="primary" />
                      <StatBlock icon={CalendarClock} label="التاريخ" value={orderedAt.date} accent="success" />
                      <StatBlock icon={CalendarClock} label="الوقت" value={orderedAt.time} accent="info" />
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <SectionTitle icon={Stethoscope} title="الطبيب المعالج" hint="كما هو مسجّل على الطلب" />
                      <div className="mt-3">
                        <OrderPersonCell
                          size="md"
                          name={
                            order.requested_by_user?.name?.trim() ||
                            order.requesting_doctor_name?.trim() ||
                            "—"
                          }
                          secondary={
                            order.requested_by_user?.username?.trim()
                              ? `@${order.requested_by_user.username}`
                              : order.requested_by_user
                                ? order.requested_by_user.role
                                : order.requesting_doctor_name?.trim()
                                  ? "طبيب معالج"
                                  : "لم يُذكر اسم الطبيب"
                          }
                          avatarUrl={order.requested_by_user?.avatar_url ?? null}
                        />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <SectionTitle icon={FileText} title="ملاحظات الطلب" hint="تعليمات أو ملاحظات إدارية" />
                      <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm leading-7 text-foreground/90">
                        {order.notes?.trim() || "— لا توجد ملاحظات —"}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="patient"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <SectionTitle icon={UserRound} title="بيانات المريض" hint="هوية المريض المرتبط بالطلب" />
                    {order.patient ? (
                      <PatientDetailCard patient={order.patient} />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                        لا توجد بيانات مريض مرتبطة (patient_id: {order.patient_id})
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="labs"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <SectionTitle icon={FlaskConical} title="التحاليل والنتائج" hint="كل بند مع جدول نتائجه" />
                      <Badge variant="outline" className="rounded-full px-3">
                        {resultsCount} قيمة
                      </Badge>
                    </div>
                    {order.items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-10 text-center">
                        <FlaskConical className="size-8 text-muted-foreground" />
                        <p className="font-semibold">لا توجد بنود تحاليل</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[...order.items]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((item, i) => (
                            <ItemResultsBlock key={item.id} item={item} index={i} />
                          ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="extra"
                    className="space-y-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-300"
                  >
                    <SectionTitle icon={Layers} title="معلومات تقنية" hint="معرّفات النظام والنسخ الاحتياطي" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <StatBlock icon={Hash} label="معرّف الطلب" value={<span dir="ltr">{order.id}</span>} />
                      <StatBlock icon={UserRound} label="patient_id" value={<span dir="ltr">{order.patient_id}</span>} accent="info" />
                      <StatBlock icon={Hash} label="created_by" value={order.created_by != null ? String(order.created_by) : "—"} />
                      <StatBlock icon={Hash} label="requested_by" value={order.requested_by != null ? String(order.requested_by) : "—"} />
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                      <SectionTitle icon={Sparkles} title="ملخص سريع" hint="نظرة على حجم الطلب" />
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-muted/40 p-3 text-right">
                          <p className="text-xs text-muted-foreground">بنود غير طبيعية</p>
                          <p className="mt-1 font-mono text-lg font-semibold">{order.items.filter((i) => i.is_abnormal).length}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3 text-right">
                          <p className="text-xs text-muted-foreground">إجمالي النتائج</p>
                          <p className="mt-1 font-mono text-lg font-semibold">{resultsCount}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3 text-right">
                          <p className="text-xs text-muted-foreground">التحاليل</p>
                          <p className="mt-1 font-mono text-lg font-semibold">{order.items.length}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full gap-2 rounded-xl sm:hidden" onClick={() => handleCopyJson(order)}>
                      <ClipboardCopy className="size-4" />
                      نسخ JSON كامل للطلب
                    </Button>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
            <div className={cn(orderDetailsStickyBar, "shrink-0")}>
                <OrderDetailsDialogHero
                  isLoading={isLoading}
                  order={order ?? null}
                  resultsCount={resultsCount}
                  orderedAt={orderedAt}
                  onCopyJson={handleCopyJson}
                />
            </div>
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
                    <p className="font-semibold text-destructive">تعذر تحميل تفاصيل الطلب</p>
                    <p className="text-sm text-muted-foreground">حاول مرة أخرى لاحقاً.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 p-10 text-center">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                      <ClipboardList className="size-6" />
                    </span>
                    <p className="font-semibold">لا توجد بيانات</p>
                    <p className="text-sm text-muted-foreground">لم يتم العثور على هذا الطلب.</p>
                  </div>
                )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
