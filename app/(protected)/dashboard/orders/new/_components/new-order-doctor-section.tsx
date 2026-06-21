"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LayoutGrid, Search, Stethoscope, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { DoctorPickerRow } from "@/features/users"
import { PatientPickAvatar } from "./patient-pick-avatar"

type NewOrderDoctorSectionProps = {
  selectedDoctor: DoctorPickerRow | null
  doctorSearch: string
  onDoctorSearchChange: (value: string) => void
  showDoctorDropdown: boolean
  onShowDoctorDropdown: (value: boolean) => void
  doctorBoxRef: React.RefObject<HTMLDivElement | null>
  doctorsLoading: boolean
  doctorRows: DoctorPickerRow[]
  onSelectDoctor: (doctor: DoctorPickerRow) => void
  onClearDoctor: () => void
  onOpenDoctorDialog: () => void
  onUseTypedDoctorName: (name: string) => void
}

export function NewOrderDoctorSection({
  selectedDoctor,
  doctorSearch,
  onDoctorSearchChange,
  showDoctorDropdown,
  onShowDoctorDropdown,
  doctorBoxRef,
  doctorsLoading,
  doctorRows,
  onSelectDoctor,
  onClearDoctor,
  onOpenDoctorDialog,
  onUseTypedDoctorName,
}: NewOrderDoctorSectionProps) {
  const canUseTypedName = doctorSearch.trim().length >= 3

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Stethoscope className="size-5 text-primary" />
          الطبيب المُحيل
        </CardTitle>
        <CardDescription>
          اختر الطبيب من النظام. وإذا لم يكن موجودًا، أضفه بالاسم ليُنشأ تلقائيًا كحساب طبيب غير نشط.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedDoctor ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group flex items-center gap-3 rounded-2xl border border-primary/25 bg-linear-to-l from-primary/8 via-primary/4 to-transparent p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary/35 hover:shadow-md"
            dir="rtl"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <PatientPickAvatar name={selectedDoctor.name} size="md" />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-base font-semibold leading-tight tracking-tight text-foreground">
                  {selectedDoctor.name}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground tabular-nums" dir="ltr">
                  @{selectedDoctor.username}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClearDoctor}
              className="shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="إلغاء اختيار الطبيب"
            >
              <X className="size-4" />
            </Button>
          </motion.div>
        ) : (
          <>
            <div ref={doctorBoxRef} className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={doctorSearch}
                  onChange={(e) => onDoctorSearchChange(e.target.value)}
                  onFocus={() => onShowDoctorDropdown(true)}
                  placeholder="ابحث عن الطبيب أو اكتب اسمه الكامل..."
                  className="h-12 rounded-xl border-border/70 pe-10 ps-3 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary/40 focus-visible:ring-primary/20"
                  aria-autocomplete="list"
                  aria-expanded={showDoctorDropdown}
                />

                <AnimatePresence>
                  {showDoctorDropdown && doctorSearch.trim() !== "" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-e-0 inset-s-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                      role="listbox"
                    >
                      <ScrollArea className="h-60">
                        <div className="p-1.5">
                          {doctorsLoading ? (
                            <div className="space-y-2 p-2">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-xl" />
                              ))}
                            </div>
                          ) : doctorRows.length > 0 ? (
                            doctorRows.map((doctor) => (
                              <button
                                key={doctor.id}
                                type="button"
                                role="option"
                                onClick={() => onSelectDoctor(doctor)}
                                className="flex w-full items-center gap-3 rounded-xl p-3 text-right outline-none transition-colors hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/30 active:bg-muted/60"
                                dir="rtl"
                              >
                                <PatientPickAvatar name={doctor.name} size="sm" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold leading-snug text-foreground">{doctor.name}</p>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm" dir="ltr">
                                    @{doctor.username}
                                  </p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="space-y-3 p-4 text-center">
                              <p className="text-sm text-muted-foreground">لا يوجد طبيب يطابق البحث</p>
                              <Button
                                type="button"
                                className="w-full gap-2 rounded-xl"
                                onClick={() => onUseTypedDoctorName(doctorSearch)}
                                disabled={!canUseTypedName}
                              >
                                <UserPlus className="size-4" />
                                قم بإضافة الطبيب
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  لم تجد الطبيب؟ يمكنك إضافته مباشرة مع تعبئة الاسم تلقائياً من البحث.
                </p>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    onClick={onOpenDoctorDialog}
                  >
                    <LayoutGrid className="size-4" />
                    عرض البطاقات
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    onClick={() => onUseTypedDoctorName(doctorSearch)}
                    disabled={!canUseTypedName}
                  >
                    <UserPlus className="size-4" />
                    قم بإضافة الطبيب
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
