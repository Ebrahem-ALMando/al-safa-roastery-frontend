"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { OrderResultBarcodePrintPortal } from "@/components/orders/order-result-barcode-print-portal"
import { Button } from "@/components/ui/button"
import { DoctorSelectionDialog } from "@/components/doctors/doctor-selection-dialog"
import { AddPatientDialog } from "@/components/patients/add-patient-dialog"
import { PatientSelectionDialog } from "@/components/patients/patient-selection-dialog"
import { NewOrderDoctorSection } from "./_components/new-order-doctor-section"
import { NewOrderPatientSection } from "./_components/new-order-patient-section"
import { NewOrderSummaryCard } from "./_components/new-order-summary-card"
import { NewOrderTestsSection } from "./_components/new-order-tests-section"
import { useNewOrderPage } from "./_hooks/use-new-order-page"

export function NewOrderPageContent() {
  const o = useNewOrderPage()
  const router = useRouter()

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <OrderResultBarcodePrintPortal
        job={o.printJob}
        onAfterPrint={() => {
          o.clearPrintJob()
          router.push("/dashboard/orders")
        }}
      />
      <AddPatientDialog
        open={o.addPatientOpen}
        onOpenChange={o.setAddPatientOpen}
        initialName={o.addPatientInitialName}
        onCreate={o.createPatient}
        onPatientSaved={o.handlePatientSaved}
      />

      <PatientSelectionDialog
        open={o.patientSelectDialogOpen}
        onOpenChange={o.setPatientSelectDialogOpen}
        onSelect={(p) => {
          o.handlePatientSaved(p)
        }}
        onRequestAddPatient={(prefill) => o.openAddPatientModal(prefill)}
      />

      <DoctorSelectionDialog
        open={o.doctorSelectDialogOpen}
        onOpenChange={o.setDoctorSelectDialogOpen}
        onSelect={(doctor) => {
          o.setSelectedDoctor(doctor)
          o.setDoctorSearch("")
        }}
        onRequestCreateDoctor={(name) => {
          o.setSelectedDoctor(null)
          o.setDoctorSearch(name.trim())
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 rounded-xl" aria-label="العودة لطلبات التحاليل">
              <ArrowRight className="size-5" />
            </Button>
          </Link>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{o.pageTitle}</h1>
            <p className="text-pretty text-sm text-muted-foreground sm:text-base">{o.pageDescription}</p>
            {o.editId != null && o.editOrderLoading ? (
              <p className="text-xs text-muted-foreground">جاري تحميل بيانات الطلب الحالي…</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <NewOrderPatientSection
            selectedPatient={o.selectedPatient}
            onClearPatient={() => o.setSelectedPatient(null)}
            patientSearch={o.patientSearch}
            onPatientSearchChange={o.setPatientSearch}
            showPatientDropdown={o.showPatientDropdown}
            onShowPatientDropdown={o.setShowPatientDropdown}
            patientBoxRef={o.patientBoxRef}
            patientsLoading={o.patientsLoading}
            patientRows={o.patientRows}
            onSelectPatient={(p) => {
              o.handlePatientSaved(p)
              o.setShowPatientDropdown(false)
            }}
            onOpenPatientCards={() => o.setPatientSelectDialogOpen(true)}
            onOpenAddPatient={o.openAddPatientModal}
          />

          <NewOrderDoctorSection
            selectedDoctor={o.selectedDoctor}
            doctorSearch={o.doctorSearch}
            onDoctorSearchChange={o.setDoctorSearch}
            showDoctorDropdown={o.showDoctorDropdown}
            onShowDoctorDropdown={o.setShowDoctorDropdown}
            doctorBoxRef={o.doctorBoxRef}
            doctorsLoading={o.doctorsLoading}
            doctorRows={o.doctorRows}
            onSelectDoctor={(doctor) => {
              o.setSelectedDoctor(doctor)
              o.setDoctorSearch("")
              o.setShowDoctorDropdown(false)
            }}
            onClearDoctor={() => {
              o.setSelectedDoctor(null)
              o.setDoctorSearch("")
            }}
            onOpenDoctorDialog={() => o.setDoctorSelectDialogOpen(true)}
            onUseTypedDoctorName={(name) => {
              o.setSelectedDoctor(null)
              o.setDoctorSearch(name.trim())
              o.setShowDoctorDropdown(false)
            }}
          />

          <NewOrderTestsSection
            testQuery={o.testQuery}
            onTestQueryChange={o.setTestQuery}
            categoryFilter={o.categoryFilter}
            onCategoryFilterChange={o.setCategoryFilter}
            categoryOptions={o.categoryOptions}
            filteredTestGroups={o.filteredTestGroups}
            totalFilteredTests={o.totalFilteredTests}
            strongMatchThreshold={o.strongMatchThreshold}
            selectedTests={o.selectedTests}
            onToggleTest={o.toggleTest}
            testsLoading={o.testsLoading}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <NewOrderSummaryCard
            selectedPatient={o.selectedPatient}
            selectedDoctor={o.selectedDoctor}
            doctorName={o.doctorSearch}
            selectedTests={o.selectedTests}
            onRemoveTest={o.removeTest}
            totalPrice={o.totalPrice}
            orderNotes={o.orderNotes}
            onOrderNotesChange={o.setOrderNotes}
            submitLabel={o.submitLabel}
            onSubmit={o.handleSubmit}
            isSubmitting={o.isSubmitting}
            canSubmit={Boolean(o.selectedPatient) && o.selectedTests.length > 0}
            showLabelPrinting={o.editId == null}
            labelCopies={o.labelCopies}
            isCustomLabelCopies={o.isCustomLabelCopies}
            customLabelCopiesInput={o.customLabelCopiesInput}
            customLabelCopiesError={o.customLabelCopiesError}
            onSelectPresetLabelCopies={o.selectPresetLabelCopies}
            onSelectCustomLabelCopies={o.selectCustomLabelCopies}
            onCustomLabelCopiesInputChange={o.applyCustomLabelCopies}
          />
        </div>
      </div>
    </div>
  )
}
