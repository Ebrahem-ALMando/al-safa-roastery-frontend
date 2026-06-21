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
  Sparkles,
  Trash2,
  Venus,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Patient } from "@/features/patients"

function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
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

function formatRelativeTimeAr(value: string | null): string {
  if (!value) return "منذ لحظات"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "منذ لحظات"

  const diffMs = Date.now() - date.getTime()
  if (diffMs <= 0) return "منذ لحظات"

  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "منذ لحظات"
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days < 30) return `منذ ${days} يوم`

  const months = Math.floor(days / 30)
  if (months < 12) return `منذ ${months} شهر`

  const years = Math.floor(months / 12)
  return `منذ ${years} سنة`
}

type PatientCardProps = {
  patient: Patient
  onEdit?: (patient: Patient) => void
  onRequestDelete?: (patient: Patient) => void
}

function patientDetailsHref(id: number) {
  return `/dashboard/patients/${id}`
}

function newOrderForPatientHref(id: number) {
  return `/dashboard/orders/new?patient=${id}`
}

export function PatientCard({ patient, onEdit, onRequestDelete }: PatientCardProps) {
  const router = useRouter()
  const isActive = patient.is_active

  const goToDetails = () => {
    router.push(patientDetailsHref(patient.id))
  }

  return (
    <TooltipProvider>
      <Card
        role="button"
        tabIndex={0}
        dir="rtl"
        className={`w-[350px] group relative flex min-w-0 flex-col justify-between overflow-hidden border-2 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
          isActive
            ? "border-primary/30 bg-linear-to-br from-white via-primary/5 to-primary/10 dark:from-card dark:via-primary/15 dark:to-primary/20"
            : "border-red-600/50 bg-linear-to-br from-white via-red-50/60 to-red-100/30 dark:from-card dark:via-red-950/20 dark:to-red-900/10"
        }`}
        onClick={goToDetails}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            goToDetails()
          }
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-5 transition-opacity duration-500 group-hover:opacity-10">
          <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-linear-to-br from-primary/20 to-primary/30 blur-xl" />
          <div className="absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-linear-to-tr from-primary/20 to-primary/30 blur-lg" />
          <div className="absolute bottom-0 left-0 h-8 w-full bg-linear-to-t from-primary/10 to-transparent" />
        </div>

        <div
          className={`absolute right-3 top-3 h-3 w-3 rounded-full animate-pulse ${
            isActive ? "bg-primary shadow-lg shadow-primary/50" : "bg-red-400 shadow-lg shadow-red-400/50"
          }`}
        />

        <CardHeader className="relative z-10 pb-3">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5">
              <Avatar className="h-12 w-12 ring-4 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials(patient.full_name) || "—"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {patient.full_name}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground" dir="ltr">
                  {patient.patient_number || "—"}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 truncate text-xs text-muted-foreground" dir="ltr">
                  <IdCard className="h-3.5 w-3.5" />
                  {patient.national_id || "—"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 text-[11px] font-medium transition-all duration-300 ${
                      isActive
                        ? "border-primary/50 bg-linear-to-r from-primary/20 to-primary/30 text-primary shadow-lg shadow-primary/20"
                        : "border-red-600/50 bg-linear-to-r from-red-100 to-pink-100 text-red-700 shadow-lg shadow-red-200/50"
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {isActive ? "نشط" : "غير نشط"}
                  </Badge>
                  {patient.gender === "male" ? (
                    <Badge className="border border-blue-200 bg-blue-500/10 text-blue-700">
                      <Mars className="h-3.5 w-3.5" />
                      ذكر
                    </Badge>
                  ) : patient.gender === "female" ? (
                    <Badge className="border border-pink-200 bg-pink-500/10 text-pink-700">
                      <Venus className="h-3.5 w-3.5" />
                      أنثى
                    </Badge>
                  ) : (
                    <Badge variant="outline">{formatGender(patient.gender)}</Badge>
                  )}
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    {getAge(patient.date_of_birth)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="max-w-[170px]">
              <Phone className="h-3.5 w-3.5" />
              <span className="truncate" dir="ltr">
                {patient.phone || "—"}
              </span>
            </Badge>
            <Badge variant="outline" className="max-w-[190px]">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{patient.email || "—"}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/60 bg-muted/40 text-muted-foreground">
              <Cake className="h-3.5 w-3.5" />
              {formatArDate(patient.date_of_birth)}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="max-w-[170px] cursor-default border-transparent bg-muted/60 hover:bg-muted/70"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="max-w-[110px] truncate">{patient.address || "—"}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="left" className="rounded-md text-right shadow-lg" dir="rtl">
                {patient.address || "—"}
              </TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className="truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground"
                onClick={(event) => event.stopPropagation()}
              >
                {patient.notes || "—"}
              </p>
            </TooltipTrigger>
            <TooltipContent side="left" className="rounded-md text-right shadow-lg" dir="rtl">
              {patient.notes || "—"}
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">{formatRelativeTimeAr(patient.created_at)}</span>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary transition-all duration-200 group-hover:scale-110 hover:bg-primary/10 hover:text-primary"
                    asChild
                  >
                    <Link
                      href={patientDetailsHref(patient.id)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="sr-only">تفاصيل المريض</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تفاصيل المريض</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary transition-all duration-200 group-hover:scale-110 hover:bg-primary/10 hover:text-primary"
                    asChild
                  >
                    <Link
                      href={newOrderForPatientHref(patient.id)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ClipboardPlus className="h-3.5 w-3.5" />
                      <span className="sr-only">إضافة طلب للمريض</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>إضافة طلب للمريض</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary transition-all duration-200 group-hover:scale-110 hover:bg-primary/10 hover:text-primary"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit?.(patient)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">تعديل</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تعديل</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 transition-all duration-200 group-hover:scale-110 hover:bg-red-50 hover:text-red-700"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRequestDelete?.(patient)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">حذف</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>حذف</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
