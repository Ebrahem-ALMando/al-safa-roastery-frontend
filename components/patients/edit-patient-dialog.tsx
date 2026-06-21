"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Loader2, Pencil, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ApiRequestError } from "@/lib/api"
import { toast } from "@/components/ui/custom-toast-with-icons"
import type { Patient, UpdatePatientInput } from "@/features/patients"
import {
  PatientFormFields,
  emptyPatientForm,
  exceedsPatientFormMedicalHistoryLimit,
  patientToForm,
  formToUpdatePayload,
  validatePatientDobOrAge,
  type PatientFormState,
} from "./patient-form-fields"

type EditPatientDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onUpdate: (id: number, payload: UpdatePatientInput) => Promise<unknown>
  onPatientUpdated?: (patient: Patient) => void
}

function mapSubmitError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 422) return "البيانات غير صحيحة"
    if (error.status === 401) return "غير مصرح"
    if (error.status === 403) return "الحساب غير مفعل"
    if (error.status >= 500) return "حدث خطأ في النظام"
    if (error.status === 0) return "تحقق من الاتصال"
  }
  return "تحقق من الاتصال"
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function EditPatientDialog({
  open,
  onOpenChange,
  patient,
  onUpdate,
  onPatientUpdated,
}: EditPatientDialogProps) {
  const [form, setForm] = React.useState<PatientFormState>(() => emptyPatientForm())
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open || !patient) return
    setForm(patientToForm(patient))
  }, [open, patient])

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!patient) return
    if (submitting) return
    if (form.fullName.trim().length < 3) {
      toast.error("الاسم الكامل مطلوب")
      return
    }
    if (exceedsPatientFormMedicalHistoryLimit(form)) {
      toast.error(
        `التاريخ المرضي بعد الدمج يتجاوز الحد المسموح (٢٠٬٠٠٠ حرفاً). قلّل النص ثم أعد المحاولة.`,
      )
      return
    }
    const dobError = validatePatientDobOrAge(form.dateOfBirth)
    if (dobError) {
      toast.error(dobError)
      return
    }
    setSubmitting(true)
    const payload = formToUpdatePayload(form)
    try {
      const updated = (await onUpdate(patient.id, payload)) as Patient
      onPatientUpdated?.(updated)
      handleOpenChange(false)
    } catch (err) {
      toast.error(mapSubmitError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!patient) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:min-h-[min(52vh,400px)] sm:max-w-[640px]"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="relative z-10 shrink-0 border-b border-border/50 bg-gradient-to-b from-background via-background to-background/95 px-6 pb-4 pt-6 backdrop-blur-sm">
            <DialogHeader className="space-y-2 text-right sm:text-right">
              <div className="flex items-start gap-3">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
                >
                  <Pencil className="size-5" aria-hidden />
                </motion.span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <DialogTitle className="text-lg font-bold leading-snug tracking-tight">
                    تعديل بيانات المريض
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground/90">{patient.full_name}</span>
                        {patient.patient_number ? (
                          <> — رقم المريض: {patient.patient_number}</>
                        ) : (
                          <> — دون رقم ملف</>
                        )}
                      </p>
                      <p>عدّل الحقول المطلوبة ثم احفظ. التنبيهات تُستخدَم لعرض أي خطأ قادم من الخادم.</p>
                    </div>
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="إغلاق"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1 1 13" />
                  </svg>
                </button>
              </div>
            </DialogHeader>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="pointer-events-none sticky top-0 z-[1] -mb-2 h-2 bg-gradient-to-b from-background to-transparent" />
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-3 px-6 py-4"
            >
              <motion.fieldset variants={fadeUp} className="min-w-0 space-y-0 border-0 p-0">
                <PatientFormFields form={form} onChange={setForm} idPrefix="edit-patient" />
              </motion.fieldset>
            </motion.div>
            <div className="pointer-events-none sticky bottom-0 z-[1] -mt-2 h-2 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="shrink-0 border-t border-border/50 bg-gradient-to-t from-muted/30 to-background px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-start gap-2">
              <Button
                type="submit"
                className="min-w-36 rounded-xl shadow-sm gap-2"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    <span>جارٍ الحفظ</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" aria-hidden />
                    حفظ التعديلات
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl gap-2"
              >
                <X className="size-4" aria-hidden />
                إلغاء
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
