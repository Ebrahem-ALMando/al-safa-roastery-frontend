"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LayoutGrid, Search, User, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { PatientPickerRow } from "@/features/patients"
import { PatientPickAvatar } from "./patient-pick-avatar"

type NewOrderPatientSectionProps = {
  selectedPatient: PatientPickerRow | null
  onClearPatient: () => void
  patientSearch: string
  onPatientSearchChange: (v: string) => void
  showPatientDropdown: boolean
  onShowPatientDropdown: (v: boolean) => void
  patientBoxRef: React.RefObject<HTMLDivElement | null>
  patientsLoading: boolean
  patientRows: PatientPickerRow[]
  onSelectPatient: (p: PatientPickerRow) => void
  onOpenPatientCards: () => void
  onOpenAddPatient: (prefill: string) => void
}

export function NewOrderPatientSection({
  selectedPatient,
  onClearPatient,
  patientSearch,
  onPatientSearchChange,
  showPatientDropdown,
  onShowPatientDropdown,
  patientBoxRef,
  patientsLoading,
  patientRows,
  onSelectPatient,
  onOpenPatientCards,
  onOpenAddPatient,
}: NewOrderPatientSectionProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="size-5 text-primary" />
          اختيار المريض
        </CardTitle>
        <CardDescription>ابحث بالاسم أو الهاتف أو رقم الهوية — أو أضف مريضاً جديداً</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedPatient ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group flex items-center gap-3 rounded-2xl border border-primary/25 bg-linear-to-l from-primary/8 via-primary/4 to-transparent p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary/35 hover:shadow-md"
            dir="rtl"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <PatientPickAvatar name={selectedPatient.name} size="md" />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-base font-semibold leading-tight tracking-tight text-foreground">
                  {selectedPatient.name}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground tabular-nums" dir="ltr">
                  {selectedPatient.phone}
                  {selectedPatient.patientNumber && selectedPatient.patientNumber !== "—" ? (
                    <span className="text-muted-foreground/80"> · {selectedPatient.patientNumber}</span>
                  ) : null}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={onClearPatient}
              className="shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="إلغاء اختيار المريض"
            >
              <X className="size-4" />
            </Button>
          </motion.div>
        ) : (
          <div ref={patientBoxRef} className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو رقم الهاتف أو الهوية..."
                value={patientSearch}
                onChange={(e) => onPatientSearchChange(e.target.value)}
                onFocus={() => onShowPatientDropdown(true)}
                className="h-12 rounded-xl border-border/70 pe-10 ps-3 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary/40 focus-visible:ring-primary/20"
                aria-autocomplete="list"
                aria-expanded={showPatientDropdown}
              />
              <AnimatePresence>
                {showPatientDropdown && patientSearch.trim() !== "" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 start-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                    role="listbox"
                  >
                    <ScrollArea className="h-60">
                      <div className="p-1.5">
                        {patientsLoading ? (
                          <div className="space-y-2 p-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Skeleton key={i} className="h-14 w-full rounded-xl" />
                            ))}
                          </div>
                        ) : patientRows.length > 0 ? (
                          patientRows.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              role="option"
                              onClick={() => onSelectPatient(patient)}
                              className="flex w-full items-center gap-3 rounded-xl p-3 text-right outline-none transition-colors hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/30 active:bg-muted/60"
                              dir="rtl"
                            >
                              <PatientPickAvatar name={patient.name} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold leading-snug text-foreground">{patient.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm" dir="ltr">
                                  {patient.phone}
                                  {patient.patientNumber && patient.patientNumber !== "—" ? (
                                    <span className="text-muted-foreground/80"> · {patient.patientNumber}</span>
                                  ) : null}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="space-y-3 p-4 text-center">
                            <p className="text-sm text-muted-foreground">لا يوجد مريض يطابق البحث</p>
                            <Button
                              type="button"
                              className="w-full gap-2 rounded-xl"
                              onClick={() => onOpenAddPatient(patientSearch)}
                            >
                              <UserPlus className="size-4" />
                              قم بإضافة المريض
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
                لم تجد المريض؟ يمكنك إضافته مباشرة مع تعبئة الاسم تلقائياً من البحث.
              </p>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  onClick={onOpenPatientCards}
                >
                  <LayoutGrid className="size-4" />
                  عرض البطاقات
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  onClick={() => onOpenAddPatient(patientSearch)}
                >
                  <UserPlus className="size-4" />
                  قم بإضافة المريض
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
