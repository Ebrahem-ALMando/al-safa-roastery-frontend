"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Hash, Loader2, Search, UserPlus, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getPersonInitials } from "@/lib/person-initials"
import { usePatientPickerList, type PatientPickerRow } from "@/features/patients"

export type PatientSelectionRow = PatientPickerRow

type PatientSelectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (patient: PatientPickerRow) => void
  onRequestAddPatient?: (prefillFromSearch: string) => void
}

function PatientAvatar({ name, className }: { name: string; className?: string }) {
  const initials = getPersonInitials(name)
  return (
    <div
      className={cn(
        "flex size-17 shrink-0 items-center justify-center rounded-full border border-sky-200/90 bg-[#e8f4fc] text-lg font-semibold tracking-tight text-sky-800 shadow-inner shadow-sky-100/80 dark:border-sky-800/55 dark:bg-sky-950/45 dark:text-sky-100 dark:shadow-none",
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}

function PickerCardSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border/50 bg-card/50 p-5">
      <Skeleton className="mb-4 size-17 shrink-0 rounded-full" />
      <Skeleton className="mb-2 h-5 w-full max-w-[140px]" />
      <Skeleton className="mb-1.5 h-4 w-full max-w-[100px]" />
      <Skeleton className="h-3.5 w-full max-w-[120px]" />
    </div>
  )
}

export function PatientSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  onRequestAddPatient,
}: PatientSelectionDialogProps) {
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const { rows, meta, isLoading, error, isSearchPending } = usePatientPickerList({
    open,
    search: query,
  })

  const handlePick = (patient: PatientPickerRow) => {
    onSelect(patient)
    onOpenChange(false)
  }

  const totalInDb = meta?.total
  const showMetaHint =
    typeof totalInDb === "number" && totalInDb > rows.length && rows.length > 0

  const showSkeleton = isLoading && rows.length === 0
  const showEmpty = !isLoading && !error && rows.length === 0
  const showGrid = rows.length > 0
  const showEndSpinner = isSearchPending || (isLoading && rows.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        className={cn("flex max-h-[min(92vh,860px)] w-[min(100%-1.25rem,940px)] max-w-[min(100%-1.25rem,940px)] flex-col overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ",
         "sm:max-w-[min(100%-1.25rem,940px)]")}  
        showCloseButton
      >
        <DialogHeader className="relative space-y-0 overflow-hidden border-b bg-linear-to-bl from-primary/10 via-primary/5 to-transparent p-0">
          <span className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="relative shrink-0">
                <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-xl" />
                <div className="flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-card text-primary shadow-md sm:size-20">
                  <Users className="size-8 sm:size-10" strokeWidth={1.5} />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-xl font-bold leading-tight sm:text-2xl">
                    اختيار المريض
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm">
                  ابحث بالاسم أو رقم الجوال أو رقم المريض — ثم اختر بطاقة من الشبكة .
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-1.5">
                 
                  {query.trim() !== "" ? (
                    <Badge variant="secondary" className="gap-1 rounded-lg text-[11px]">
                      {rows?.length} مطابقة
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="relative">
                {showEndSpinner ? (
                  <Loader2 className="pointer-events-none absolute right-4 top-1/2 z-1 size-4 -translate-y-1/2 animate-spin text-primary" />
                ) : null}
                <Search className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="الاسم، الهاتف، رقم المريض..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={cn(
                    "h-11 rounded-xl border-border/60 bg-card/80 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/70",
                    showEndSpinner ? "pe-16" : "pe-10",
                    query.trim() !== "" ? "ps-16" : "ps-3"
                  )}
                  aria-label="بحث المرضى"
                />
                {query.trim() !== "" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute  top-1/2 h-8 -translate-y-1/2 rounded-lg text-xs text-muted-foreground left-1"
                    onClick={() => setQuery("")}
                  >
                    مسح
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[calc(94vh-280px)]">
            <div className="p-5 sm:p-6">
              {error ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <AlertCircle className="size-6" />
                  </span>
                  <p className="font-semibold text-destructive">تعذر تحميل المرضى</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    تحقق من الاتصال أو صلاحيات الجلسة ثم أعد فتح النافذة.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {showSkeleton ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[920px]:grid-cols-5"
                    >
                      {Array.from({ length: 10 }).map((_, i) => (
                        <PickerCardSkeleton key={i} />
                      ))}
                    </motion.div>
                  ) : showGrid ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {showMetaHint ? (
                        <p className="text-center text-[11px] text-muted-foreground">
                          يُعرض أول {rows.length} نتيجة من أصل {totalInDb?.toLocaleString("ar-SA")} — زِد دقة البحث لتحديد النتائج.
                        </p>
                      ) : null}
                      <div
                      dir="rtl"
                      className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[920px]:grid-cols-5">
                        {rows.map((patient, index) => (
                          <motion.button
                            key={patient.id}
                            type="button"
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.45), duration: 0.22 }}
                            onClick={() => handlePick(patient)}
                            className={cn(
                              "group relative flex w-full flex-col items-center overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 text-center shadow-sm transition-all duration-300 sm:p-5",
                              "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-lg",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            )}
                          >
                            <span className="pointer-events-none absolute inset-y-0 right-0 w-1 rounded-l-full bg-primary/25 transition-all duration-300 group-hover:bg-primary group-hover:w-1" />
                            <PatientAvatar name={patient.name} className="mb-3 sm:mb-4" />
                            <p className="line-clamp-2 w-full text-sm font-bold leading-snug text-foreground sm:text-base">
                              {patient.name}
                            </p>
                            <p
                              className="mt-1.5 line-clamp-1 w-full text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400"
                              dir="ltr"
                            >
                              {patient.patientNumber}
                            </p>
                            <p
                              className="mt-1 line-clamp-1 w-full text-[12px] tabular-nums text-muted-foreground sm:text-[13px]"
                              dir="ltr"
                            >
                              {patient.phone}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : showEmpty ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-14 text-center"
                    >
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                        <Search className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold">لا توجد نتائج</p>
                        <p className="max-w-md text-sm text-muted-foreground">
                          لم يُعثر على مرضى يطابقون البحث على السيرفر. جرّب نصاً آخر أو أضف مريضاً جديداً.
                        </p>
                      </div>
                      {onRequestAddPatient ? (
                        <Button
                          type="button"
                          className="gap-2 rounded-xl"
                          onClick={() => {
                            onRequestAddPatient(query)
                            onOpenChange(false)
                          }}
                        >
                          <UserPlus className="size-4" />
                          إضافة مريض
                        </Button>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
