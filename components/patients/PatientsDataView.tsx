"use client"

import type { Patient, PatientsListMeta, PatientsViewMode } from "@/features/patients"
import { PatientsTableView } from "./PatientsTableView"
import { PatientsCardsView } from "./PatientsCardsView"

interface PatientsDataViewProps {
  viewMode: PatientsViewMode
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

export function PatientsDataView(props: PatientsDataViewProps) {
  if (props.viewMode === "cards") {
    return (
      <PatientsCardsView
        patients={props.patients}
        isLoading={props.isLoading}
        isFilteredNoHits={props.isFilteredNoHits}
        isTrueEmpty={props.isTrueEmpty}
        onAddPatient={props.onAddPatient}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        meta={props.meta}
        currentPage={props.currentPage}
        canPrev={props.canPrev}
        canNext={props.canNext}
        onPageChange={props.onPageChange}
      />
    )
  }

  return (
    <PatientsTableView
      patients={props.patients}
      meta={props.meta}
      isLoading={props.isLoading}
      isFilteredNoHits={props.isFilteredNoHits}
      isTrueEmpty={props.isTrueEmpty}
      currentPage={props.currentPage}
      lastPage={props.lastPage}
      canPrev={props.canPrev}
      canNext={props.canNext}
      onPageChange={props.onPageChange}
      onAddPatient={props.onAddPatient}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
    />
  )
}

