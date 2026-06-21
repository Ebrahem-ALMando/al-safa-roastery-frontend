"use client"

import { UserX } from "lucide-react"
import { PatientCard } from "@/components/cards/patient-card"
import { Button } from "@/components/ui/button"
import type { Patient, PatientsListMeta } from "@/features/patients"

interface PatientsCardsViewProps {
  patients: Patient[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  onAddPatient: () => void
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
  meta?: PatientsListMeta
  currentPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
}

export function PatientsCardsView({
  patients,
  isLoading = false,
  isFilteredNoHits,
  isTrueEmpty,
  onAddPatient,
  onEdit,
  onDelete,
  meta,
  currentPage,
  canPrev,
  canNext,
  onPageChange,
}: PatientsCardsViewProps) {
  if (isLoading) {
    return <div className="p-6 text-center text-sm text-muted-foreground">جارِ التحميل...</div>
  }

  if (isFilteredNoHits) {
    return <div className="p-6 text-center text-sm text-muted-foreground">لم يتم العثور على نتائج</div>
  }

  if (isTrueEmpty) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/80 text-primary shadow-sm">
          <UserX className="size-10 animate-pulse" strokeWidth={1.25} />
        </div>
        <p className="text-lg font-semibold">لا يوجد مرضى حالياً</p>
        <Button onClick={onAddPatient}>إضافة مريض</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3  *:min-w-0">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onEdit={onEdit}
            onRequestDelete={onDelete}
          />
        ))}
      </div>

      {meta && meta.last_page > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-border/40 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {currentPage} من {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            التالي
          </Button>
        </div>
      ) : null}
    </div>
  )
}

