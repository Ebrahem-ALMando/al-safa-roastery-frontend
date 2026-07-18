"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { ApiRequestError } from "@/lib/api"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  calculateRemaining,
  calculateSubtotal,
  calculateTotal,
  emptyPurchaseEditorForm,
  formToSavePayload,
  formsEqual,
  purchaseToEditorForm,
  PURCHASE_MESSAGES,
  usePurchaseDetails,
  usePurchaseEditorMutations,
} from "@/features/purchases"
import {
  hasPurchaseEditorErrors,
  mapPurchaseEditorApiErrors,
  validatePurchaseEditorForm,
} from "@/features/purchases/lib/purchase-editor.validation"
import type { PurchaseEditorFieldErrors, PurchaseEditorFormState } from "@/features/purchases/types/purchase-editor.types"
import { PurchaseEditorSupplierSection } from "./PurchaseEditorSupplierSection"
import { PurchaseEditorInvoiceInfo } from "./PurchaseEditorInvoiceInfo"
import { PurchaseEditorLinesSection } from "./PurchaseEditorLinesSection"
import { PurchaseEditorNotesSection } from "./PurchaseEditorNotesSection"
import { PurchaseEditorSummaryPanel } from "./PurchaseEditorSummaryPanel"
import { PurchaseCompleteConfirmDialog } from "./PurchaseCompleteConfirmDialog"

type PurchaseInvoiceEditorProps = {
  mode: "create" | "edit"
  purchaseId?: number
}

export function PurchaseInvoiceEditor({ mode, purchaseId }: PurchaseInvoiceEditorProps) {
  const router = useRouter()
  const isEdit = mode === "edit" && purchaseId != null
  const { purchase, isLoading, error } = usePurchaseDetails(isEdit ? purchaseId : null)
  const { createDraft, updateDraft, completeDraft, storeAndComplete } = usePurchaseEditorMutations()

  const [form, setForm] = React.useState<PurchaseEditorFormState>(emptyPurchaseEditorForm)
  const [initialForm, setInitialForm] = React.useState<PurchaseEditorFormState>(emptyPurchaseEditorForm)
  const [hydrated, setHydrated] = React.useState(!isEdit)
  const [fieldErrors, setFieldErrors] = React.useState<PurchaseEditorFieldErrors>({})
  const [isSaving, setIsSaving] = React.useState(false)
  const [isCompleting, setIsCompleting] = React.useState(false)
  const [completeOpen, setCompleteOpen] = React.useState(false)
  const submitLock = React.useRef(false)

  const focusFirstInvalid = React.useCallback((errors: PurchaseEditorFieldErrors) => {
    const lineFields = Object.keys(errors).filter((field) => field.startsWith("lines."))
    const priority = [
      "supplier_id",
      "invoice_date",
      ...lineFields,
      "lines",
      "discount",
      "paid_amount",
      "payment_method",
      "invoice_number",
    ]
    const field = priority.find((candidate) => Boolean(errors[candidate]))
    if (!field) return

    window.setTimeout(() => {
      let target = document.querySelector<HTMLElement>(`[data-purchase-field="${field}"]`)
      if (!target && field.startsWith("lines.")) {
        const lineIndex = Number.parseInt(field.split(".")[1] ?? "", 10)
        if (Number.isFinite(lineIndex)) {
          target = document.querySelector<HTMLElement>(`[data-purchase-line-index="${lineIndex}"]`)
        }
      }
      if (!target && field.startsWith("lines")) {
        target = document.querySelector<HTMLElement>('[data-purchase-field="lines"]')
      }
      if (!target) return
      target.scrollIntoView({ behavior: "smooth", block: "center" })
      window.requestAnimationFrame(() => target?.focus({ preventScroll: true }))
    }, 0)
  }, [])

  React.useEffect(() => {
    if (!isEdit || !purchase) return
    if (purchase.status !== "draft") {
      toast.error(PURCHASE_MESSAGES.notEditable)
      router.replace(`/dashboard/purchases/${purchase.id}`)
      return
    }
    const next = purchaseToEditorForm(purchase)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate the editor once the draft purchase is loaded.
    setForm(next)
    setInitialForm(next)
    setHydrated(true)
  }, [isEdit, purchase, router])

  const pageTitle = isEdit ? "تعديل مسودة فاتورة الشراء" : "إنشاء فاتورة شراء"
  const breadcrumbAction = isEdit ? "تعديل مسودة فاتورة الشراء" : "إنشاء فاتورة شراء"

  function patchForm(patch: Partial<PurchaseEditorFormState>) {
    setForm((prev) => ({ ...prev, ...patch }))
    setFieldErrors({})
  }

  function handleCancel() {
    if (!formsEqual(form, initialForm)) {
      const ok = window.confirm("لديك تغييرات غير محفوظة. هل تريد المغادرة؟")
      if (!ok) return
    }
    router.push("/dashboard/purchases")
  }

  async function runSaveDraft(): Promise<number | null> {
    const errors = validatePurchaseEditorForm(form)
    if (hasPurchaseEditorErrors(errors)) {
      setFieldErrors(errors)
      focusFirstInvalid(errors)
      toast.error("يرجى تصحيح الأخطاء قبل الحفظ.")
      return null
    }

    const payload = formToSavePayload(form)

    if (isEdit && purchaseId != null) {
      const updated = await updateDraft(purchaseId, payload)
      setInitialForm(form)
      return updated.id
    }

    const created = await createDraft(payload)
    setInitialForm(form)
    return created.id
  }

  async function handleSaveDraft() {
    if (submitLock.current) return
    submitLock.current = true
    setIsSaving(true)
    try {
      const id = await runSaveDraft()
      if (id != null && !isEdit) {
        router.replace(`/dashboard/purchases/${id}/edit`)
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const errors = mapPurchaseEditorApiErrors(err)
        setFieldErrors(errors)
        focusFirstInvalid(errors)
      }
      toast.error(PURCHASE_MESSAGES.failure)
    } finally {
      setIsSaving(false)
      submitLock.current = false
    }
  }

  async function handleCompleteConfirmed() {
    if (submitLock.current) return
    submitLock.current = true
    setIsCompleting(true)
    try {
      const errors = validatePurchaseEditorForm(form)
      if (hasPurchaseEditorErrors(errors)) {
        setFieldErrors(errors)
        focusFirstInvalid(errors)
        toast.error("يرجى تصحيح الأخطاء قبل الاعتماد.")
        setCompleteOpen(false)
        return
      }

      const payload = formToSavePayload(form)
      let resultId: number

      if (isEdit && purchaseId != null) {
        const dirty = !formsEqual(form, initialForm)
        if (dirty) {
          await updateDraft(purchaseId, payload)
        }
        const completed = await completeDraft(purchaseId)
        resultId = completed.id
      } else {
        const completed = await storeAndComplete(payload)
        resultId = completed.id
      }

      setCompleteOpen(false)
      router.push(`/dashboard/purchases/${resultId}`)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const errors = mapPurchaseEditorApiErrors(err)
        setFieldErrors(errors)
        focusFirstInvalid(errors)
      }
      toast.error(PURCHASE_MESSAGES.failure)
      setCompleteOpen(false)
    } finally {
      setIsCompleting(false)
      submitLock.current = false
    }
  }

  const openCompleteDialog = React.useCallback(() => {
    const errors = validatePurchaseEditorForm(form)
    if (hasPurchaseEditorErrors(errors)) {
      setFieldErrors(errors)
      focusFirstInvalid(errors)
      toast.error("يرجى تصحيح الأخطاء قبل الاعتماد.")
      return
    }
    setCompleteOpen(true)
  }, [focusFirstInvalid, form])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.code !== "Enter" && event.code !== "NumpadEnter") return
      if (isSaving || isCompleting || completeOpen) return
      if (document.querySelector('[data-slot="dialog-content"][data-state="open"], [data-slot="alert-dialog-content"][data-state="open"]')) return

      event.preventDefault()
      event.stopPropagation()
      openCompleteDialog()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [completeOpen, isCompleting, isSaving, openCompleteDialog])

  if (isEdit && (isLoading || !hydrated)) {
    return (
      <div className="space-y-6 p-4" dir="rtl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (isEdit && error) {
    return (
      <div className="p-6 text-center text-destructive" dir="rtl">
        تعذر تحميل الفاتورة.
      </div>
    )
  }

  const subtotal = calculateSubtotal(form.lines)
  const total = calculateTotal(subtotal, form.discount)
  const remaining = calculateRemaining(total, form.paidAmount)

  return (
    <div className="space-y-6 pb-8" dir="rtl" lang="ar">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/purchases">
            <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 rounded-xl" aria-label="العودة">
              <ArrowRight className="size-5" />
            </Button>
          </Link>
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-muted-foreground">
              المشتريات / {breadcrumbAction}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-pretty text-sm text-muted-foreground sm:text-base">
              أدخل بيانات المورد والأصناف، ثم احفظ الفاتورة كمسودة أو اعتمدها لتحديث المخزون
              والحسابات.
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> يشير إلى حقل مطلوب.
            </p>
          </div>
        </div>
        {isSaving || isCompleting ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            جارٍ المعالجة…
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PurchaseEditorSupplierSection
            value={form.supplier}
            onChange={(supplier) => patchForm({ supplier })}
            error={fieldErrors.supplier_id}
            disabled={isSaving || isCompleting}
          />
          <PurchaseEditorLinesSection
            lines={form.lines}
            onChange={(lines) => patchForm({ lines })}
            fieldErrors={fieldErrors}
            disabled={isSaving || isCompleting}
          />
          <PurchaseEditorInvoiceInfo
            form={form}
            invoiceTotal={total}
            onChange={patchForm}
            fieldErrors={fieldErrors}
            disabled={isSaving || isCompleting}
          />
          <PurchaseEditorNotesSection
            value={form.notes}
            onChange={(notes) => patchForm({ notes })}
            disabled={isSaving || isCompleting}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <PurchaseEditorSummaryPanel
            form={form}
            fieldErrors={fieldErrors}
            onCancel={handleCancel}
            onSaveDraft={handleSaveDraft}
            onComplete={openCompleteDialog}
            isSaving={isSaving}
            isCompleting={isCompleting}
            disabled={isSaving || isCompleting}
          />
        </div>
      </div>

      <PurchaseCompleteConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onConfirm={handleCompleteConfirmed}
        supplierName={form.supplier?.name ?? "—"}
        total={total}
        paidAmount={Number.parseFloat(form.paidAmount || "0") || 0}
        remaining={remaining}
        isSubmitting={isCompleting}
      />
    </div>
  )
}
