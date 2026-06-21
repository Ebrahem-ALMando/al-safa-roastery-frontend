"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Plus, Settings2 } from "lucide-react"
import { DashboardPageHeader, OperationalDateScopeControls } from "@/components/dashboard"
import { AddPatientDialog } from "@/components/patients/add-patient-dialog"
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog"
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog"
import { PatientsDataView } from "@/components/patients/PatientsDataView"
import { PatientsFilters } from "@/components/patients/PatientsFilters"
import { PatientsSummary } from "@/components/patients/PatientsSummary"
import { PatientsViewToggle } from "@/components/patients/PatientsViewToggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePatientActions, usePatientsPage, type Patient } from "@/features/patients"

export function PatientsView() {
  const {
    dateScopePreset,
    setDateScopePreset,
    search,
    setSearch,
    gender,
    setGender,
    isActive,
    setIsActive,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    patients,
    meta,
    isLoading,
    error,
    mutate,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  } = usePatientsPage()

  const { createPatient, updatePatient, deletePatient } = usePatientActions()

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)

  function openEdit(patient: Patient) {
    setEditPatient(patient)
    setEditOpen(true)
  }

  function openDelete(patient: Patient) {
    setDeleteTarget(patient)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold tracking-tight">
            المرضى
            /
          <p className="text-md text-muted-foreground">  إدارة بيانات المرضى</p>
            </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <OperationalDateScopeControls preset={dateScopePreset} onPresetChange={setDateScopePreset} />
          <Button onClick={() => setAddOpen(true)} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            إضافة مريض
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Settings2 className="h-4 w-4" />
                تخصيص الصفحة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>خيارات العرض</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={config.showKPI}
                onCheckedChange={(checked) => toggleShowKPI(Boolean(checked))}
              >
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={config.showFilters}
                onCheckedChange={(checked) => toggleShowFilters(Boolean(checked))}
              >
                إظهار الفلاتر
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileText className="h-4 w-4" />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <PatientsViewToggle viewMode={config.viewMode} onViewModeChange={setViewMode} />
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {config.showKPI ? (
        <PatientsSummary patients={patients} meta={meta} isLoading={isLoading} />
      ) : null}

      {config.showFilters ? (
        <PatientsFilters
          value={{ search, gender, isActive }}
          onChange={(next) => {
            setSearch(next.search)
            setGender(next.gender)
            setIsActive(next.isActive)
          }}
          isLoading={isLoading}
        />
      ) : null}

      {error && !isLoading ? (
        <p className="text-center text-sm text-muted-foreground" role="status">
          تعذر تحميل البيانات. حاول مرة أخرى.
        </p>
      ) : null}

      <div
        className={
          config.viewMode === "cards"
            ? "overflow-hidden"
            : "overflow-hidden rounded-xl border border-border/60 shadow-sm"
        }
      >
        <PatientsDataView
          viewMode={config.viewMode}
          patients={patients}
          meta={meta}
          isLoading={isLoading}
          isFilteredNoHits={isFilteredNoHits}
          isTrueEmpty={isTrueEmpty}
          currentPage={currentPage}
          lastPage={lastPage}
          canPrev={canPrev}
          canNext={canNext}
          onPageChange={setPage}
          onAddPatient={() => setAddOpen(true)}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>

      <AddPatientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={createPatient}
        onPatientSaved={() => {
          void mutate()
        }}
      />
      <EditPatientDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditPatient(null)
        }}
        patient={editPatient}
        onUpdate={updatePatient}
        onPatientUpdated={() => {
          void mutate()
        }}
      />
      <DeletePatientDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
        patient={deleteTarget}
        onDelete={async (id) => {
          await deletePatient(id)
        }}
      />
    </div>
  )
}

