"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Cake,
  CheckCircle2,
  ClipboardPlus,
  Eye,
  IdCard,
  Mail,
  MapPin,
  Mars,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserX,
  Venus,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Patient, PatientsListMeta } from "@/features/patients"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PatientsTableViewProps {
  patients: Patient[]
  meta?: PatientsListMeta
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddPatient: () => void
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

function patientDetailsHref(id: number) {
  return `/dashboard/patients/${id}`
}

function newOrderForPatientHref(id: number) {
  return `/dashboard/orders/new?patient=${id}`
}

function formatArDate(value: string | null): string {
  if (!value) {
    return "—"
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    return "—"
  }
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatGender(gender: string | null): string {
  if (gender === "male") return "ذكر"
  if (gender === "female") return "أنثى"
  return "—"
}

function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}

function getAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return "—"
  const birthDate = new Date(dateOfBirth)
  if (Number.isNaN(birthDate.getTime())) return "—"

  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  const monthDiff = now.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age >= 0 ? `${age} سنة` : "—"
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-28" /><Skeleton className="mt-2 h-3 w-20" /></TableCell>
      <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-16 rounded-full" /></TableCell>
      <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-20" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-6 w-24 rounded-full" /><Skeleton className="mt-2 h-6 w-28 rounded-full" /><Skeleton className="mt-2 h-6 w-28 rounded-full" /></TableCell>
      <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-16 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-20" /></TableCell>
      <TableCell className="text-center"><Skeleton className="mx-auto h-8 w-24" /></TableCell>
    </TableRow>
  )
}

export function PatientsTableView({
  patients,
  meta,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  currentPage,
  lastPage,
  canPrev,
  canNext,
  onPageChange,
  onAddPatient,
  onEdit,
  onDelete,
}: PatientsTableViewProps) {
  const router = useRouter()

  return (
    <div className="p-0">
      {isLoading ? (
        <div className="w-full">
          <Table className="w-full table-fixed" dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[4%] text-center font-semibold">#</TableHead>
                <TableHead className="w-[20%] text-right font-semibold">المعلومات الأساسية</TableHead>
                <TableHead className="w-[10%] text-center font-semibold">الجنس</TableHead>
                <TableHead className="w-[12%] text-center font-semibold">تاريخ الميلاد</TableHead>
                <TableHead className="w-[22%] text-right font-semibold">معلومات التواصل</TableHead>
                <TableHead className="w-[8%] text-center font-semibold">الحالة</TableHead>
                <TableHead className="w-[10%] text-right font-semibold">ملاحظات</TableHead>
                <TableHead className="w-[8%] text-center font-semibold">تاريخ الإنشاء</TableHead>
                <TableHead className="w-[10%] text-center font-semibold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }, (_, u) => (
                <TableRowSkeleton key={`sk-${u}`} />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : isFilteredNoHits ? (
        <div className="min-h-[240px]">
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 border-0 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/30 text-muted-foreground">
              <Search className="size-6 opacity-60" />
            </div>
            <p className="font-medium">لم يتم العثور على نتائج</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              جرّب تغيير البحث أو إعادة التصفية
            </p>
          </div>
        </div>
      ) : isTrueEmpty ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
            <UserX className="size-10 animate-pulse" strokeWidth={1.25} />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">لا يوجد مرضى حالياً</p>
            <p className="text-sm text-muted-foreground">ابدأ بإضافة مريض جديد لإدارة بياناته</p>
          </div>
          <Button type="button" onClick={onAddPatient} className="gap-2 rounded-xl">
            <Plus className="size-4" />
            إضافة مريض
          </Button>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="w-full">
            <Table className="w-full table-fixed" dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[4%] text-center font-semibold">#</TableHead>
                  <TableHead className="w-[20%] text-right font-semibold">المعلومات الأساسية</TableHead>
                  <TableHead className="w-[8%] text-center font-semibold">الجنس</TableHead>
                  <TableHead className="w-[12%] text-center font-semibold">تاريخ الميلاد</TableHead>
                  <TableHead className="w-[20%] text-right font-semibold">معلومات التواصل</TableHead>
                  <TableHead className="w-[8%] text-center font-semibold">الحالة</TableHead>
                  <TableHead className="w-[10%] text-right font-semibold">ملاحظات</TableHead>
                  <TableHead className="w-[8%] text-center font-semibold">تاريخ الإنشاء</TableHead>
                  <TableHead className="w-[13%] text-center font-semibold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient: Patient, index: number) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-muted/40 transition-all duration-200"
                    onClick={() => router.push(patientDetailsHref(patient.id))}
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-start gap-2.5">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {initialsFromName(patient.full_name) || "—"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight truncate">{patient.full_name}</p>
                          <p className="mt-1 text-xs text-muted-foreground truncate" dir="ltr">
                            {patient.patient_number || "—"}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground truncate" dir="ltr">
                            <IdCard className="size-3.5" />
                            {patient.national_id || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {patient.gender === "male" ? (
                        <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">
                          <Mars className="size-3.5" />
                          ذكر
                        </Badge>
                      ) : patient.gender === "female" ? (
                        <Badge className="bg-pink-500/10 text-pink-700 hover:bg-pink-500/20">
                          <Venus className="size-3.5" />
                          أنثى
                        </Badge>
                      ) : (
                        <Badge variant="outline">{formatGender(patient.gender)}</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <p className="text-xs">{formatArDate(patient.date_of_birth)}</p>
                      <div className="mt-1 flex justify-center">
                        <Badge variant="outline" className="gap-1">
                          <Cake className="size-3.5" />
                          {getAge(patient.date_of_birth)}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="secondary" className="max-w-[170px]">
                          <Phone className="size-3.5" />
                          <span className="truncate" dir="ltr">{patient.phone || "—"}</span>
                        </Badge>
                        <Badge variant="outline" className="max-w-[170px]">
                          <Mail className="size-3.5" />
                          <span className="truncate">{patient.email || "—"}</span>
                        </Badge>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="max-w-[170px] border-transparent bg-muted/60 hover:bg-muted/70">
                              <MapPin className="size-3.5" />
                              <span className="truncate max-w-[120px]">{patient.address || "—"}</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="rounded-md shadow-lg text-right" dir="rtl">
                            {patient.address || "—"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {patient.is_active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
                          <CheckCircle2 className="size-3.5" />
                          نشط
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                          <XCircle className="size-3.5" />
                          غير نشط
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="truncate max-w-[160px] text-sm">
                            {patient.notes || "—"}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="rounded-md shadow-lg text-right"
                          dir="rtl"
                        >
                          {patient.notes || "—"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    <TableCell className="text-center text-xs">
                      {formatArDate(patient.created_at)}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg hover:text-primary"
                              asChild
                            >
                              <Link
                                href={patientDetailsHref(patient.id)}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Eye className="size-4" />
                                <span className="sr-only">تفاصيل المريض</span>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                            تفاصيل المريض
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg hover:text-primary"
                              asChild
                            >
                              <Link
                                href={newOrderForPatientHref(patient.id)}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <ClipboardPlus className="size-4" />
                                <span className="sr-only">إضافة طلب للمريض</span>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-md shadow-lg" dir="rtl">
                            إضافة طلب للمريض
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg hover:text-primary"
                              onClick={(event) => {
                                event.stopPropagation()
                                onEdit(patient)
                              }}
                            >
                              <Pencil className="size-4" />
                              <span className="sr-only">تعديل</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-md shadow-lg" dir="rtl">تعديل</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg text-destructive hover:text-destructive"
                              onClick={(event) => {
                                event.stopPropagation()
                                onDelete(patient)
                              }}
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">حذف</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-md shadow-lg" dir="rtl">حذف</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      )}

      {!isLoading && patients.length > 0 && meta != null && lastPage > 1 ? (
        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <p className="text-center text-sm text-muted-foreground sm:text-start" dir="ltr">
            {meta.total} — صفحة {currentPage} من {lastPage}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!canPrev}
            >
              <ChevronRight className="size-4" />
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canNext}
            >
              التالي
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

