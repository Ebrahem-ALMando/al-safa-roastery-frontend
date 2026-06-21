"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Fingerprint, Loader2, UserPlus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ApiRequestError } from "@/lib/api"
import { toast } from "@/components/ui/custom-toast-with-icons"
import type { CreatePatientInput, Patient } from "@/features/patients"
import {
  PatientFormFields,
  emptyPatientForm,
  exceedsPatientFormMedicalHistoryLimit,
  formToCreatePayload,
  validatePatientDobOrAge,
  type PatientFormState,
} from "./patient-form-fields"

export interface SavedPatientBrief {
  id: string
  name: string
  phone: string
  patientNumber: string
}

interface AddPatientDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialName?: string
  onCreate?: (payload: CreatePatientInput) => Promise<unknown>
  onPatientSaved?: (patient: SavedPatientBrief) => void
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function AddPatientDialog({
  children,
  open: openProp,
  onOpenChange,
  initialName,
  onCreate,
  onPatientSaved,
}: AddPatientDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const [form, setForm] = React.useState<PatientFormState>(emptyPatientForm)
  const [submitting, setSubmitting] = React.useState(false)

  const resetForm = () => {
    setForm(emptyPatientForm())
  }

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
    if (!next) {
      resetForm()
    }
  }

  React.useEffect(() => {
    if (!open) return
    const next = emptyPatientForm()
    const trimmed = (initialName ?? "").trim()
    if (trimmed) {
      next.fullName = trimmed
    }
    setForm(next)
  }, [open, initialName])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const fullName = form.fullName.trim()
    if (fullName.length < 3) {
      toast.error("الاسم الكامل مطلوب")
      return
    }

    const normalizedPhone = form.phone.trim()
    const normalizedEmail = form.email.trim()
    if (normalizedPhone && !/^\d+$/.test(normalizedPhone)) {
      toast.error("رقم الهاتف يجب أن يحتوي أرقاماً فقط")
      return
    }
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      toast.error("صيغة البريد الإلكتروني غير صحيحة")
      return
    }

    if (exceedsPatientFormMedicalHistoryLimit(form)) {
      toast.error(`التاريخ المرضي بعد الدمج يتجاوز الحد المسموح (٢٠٬٠٠٠ حرفاً). قلّل النص ثم أعد المحاولة.`)
      return
    }

    const dobError = validatePatientDobOrAge(form.dateOfBirth)
    if (dobError) {
      toast.error(dobError)
      return
    }

    if (!onCreate) {
      onPatientSaved?.({
        id: `p-${Date.now()}`,
        name: fullName,
        phone: form.phone,
        patientNumber: "—",
      })
      toast.success("تم حفظ المريض بنجاح")
      handleOpenChange(false)
      return
    }

    setSubmitting(true)
    const payload = formToCreatePayload(form)
    try {
      const created = (await onCreate(payload)) as Patient
      onPatientSaved?.({
        id: String(created.id),
        name: created.full_name,
        phone: created.phone || "",
        patientNumber: created.patient_number || "—",
      })
      handleOpenChange(false)
    } catch (err) {
      toast.error(mapSubmitError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {children || (
            <Button className="gap-2 rounded-xl">
              <UserPlus className="size-4" />
              إضافة مريض
            </Button>
          )}
        </DialogTrigger>
      )}

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
                  aria-hidden
                >
                  <Fingerprint className="size-5" />
                </motion.span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <DialogTitle className="text-lg font-bold leading-snug tracking-tight">
                    إضافة مريض جديد
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                      <p>
                        املأ الحقول التالية بعناية لإنشاء ملف مريض جديد. يولّد النظام{" "}
                        <span className="font-medium text-foreground/90">رقم الملف تلقائياً</span> بعد الحفظ.
                      </p>
                      <p>
                        <span className="text-destructive">*</span> يشير إلى حقل مطلوب.
                      </p>
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
                <PatientFormFields
                  form={form}
                  onChange={setForm}
                  idPrefix="add-patient"
                  nameFieldAutoFocus
                />
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
                    حفظ المريض
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
