"use client"

import * as React from "react"
import { Check, Loader2, Truck, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { ApiRequestError } from "@/lib/api"
import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from "@/features/suppliers"

export type SupplierFormState = {
  code: string
  name: string
  contactPerson: string
  phone: string
  secondaryPhone: string
  whatsapp: string
  email: string
  address: string
  creditLimit: string
  openingBalance: string
  notes: string
  isActive: boolean
}

export function emptySupplierForm(): SupplierFormState {
  return {
    code: "",
    name: "",
    contactPerson: "",
    phone: "",
    secondaryPhone: "",
    whatsapp: "",
    email: "",
    address: "",
    creditLimit: "",
    openingBalance: "",
    notes: "",
    isActive: true,
  }
}

function supplierToForm(supplier: Supplier): SupplierFormState {
  return {
    code: supplier.code ?? "",
    name: supplier.name ?? "",
    contactPerson: supplier.contact_person ?? "",
    phone: supplier.phone ?? "",
    secondaryPhone: supplier.secondary_phone ?? "",
    whatsapp: supplier.whatsapp ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
    creditLimit: supplier.credit_limit != null ? String(supplier.credit_limit) : "",
    openingBalance: "",
    notes: supplier.notes ?? "",
    isActive: supplier.is_active,
  }
}

function formToCreatePayload(form: SupplierFormState): CreateSupplierInput {
  const payload: CreateSupplierInput = {
    name: form.name.trim(),
    is_active: form.isActive,
  }
  if (form.code.trim()) payload.code = form.code.trim()
  if (form.contactPerson.trim()) payload.contact_person = form.contactPerson.trim()
  if (form.phone.trim()) payload.phone = form.phone.trim()
  if (form.secondaryPhone.trim()) payload.secondary_phone = form.secondaryPhone.trim()
  if (form.whatsapp.trim()) payload.whatsapp = form.whatsapp.trim()
  if (form.email.trim()) payload.email = form.email.trim()
  if (form.address.trim()) payload.address = form.address.trim()
  if (form.notes.trim()) payload.notes = form.notes.trim()
  if (form.creditLimit.trim()) {
    const n = Number.parseFloat(form.creditLimit)
    if (Number.isFinite(n)) payload.credit_limit = n
  }
  if (form.openingBalance.trim()) {
    const n = Number.parseFloat(form.openingBalance)
    if (Number.isFinite(n)) payload.opening_balance = n
  }
  return payload
}

function formToUpdatePayload(form: SupplierFormState): UpdateSupplierInput {
  const payload: UpdateSupplierInput = {
    name: form.name.trim(),
    code: form.code.trim() || null,
    contact_person: form.contactPerson.trim() || null,
    phone: form.phone.trim() || null,
    secondary_phone: form.secondaryPhone.trim() || null,
    whatsapp: form.whatsapp.trim() || null,
    email: form.email.trim() || null,
    address: form.address.trim() || null,
    notes: form.notes.trim() || null,
    is_active: form.isActive,
  }
  if (form.creditLimit.trim()) {
    const n = Number.parseFloat(form.creditLimit)
    payload.credit_limit = Number.isFinite(n) ? n : null
  } else {
    payload.credit_limit = null
  }
  return payload
}

function mapSubmitError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 422) return error.message || "البيانات غير صحيحة"
    if (error.status === 401) return "غير مصرح"
    if (error.status >= 500) return "حدث خطأ في النظام"
    if (error.status === 0) return "تحقق من الاتصال"
  }
  return "تحقق من الاتصال"
}

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  supplier?: Supplier | null
  onCreate?: (payload: CreateSupplierInput) => Promise<unknown>
  onUpdate?: (id: number, payload: UpdateSupplierInput) => Promise<unknown>
  onSaved?: () => void
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  mode,
  supplier,
  onCreate,
  onUpdate,
  onSaved,
}: SupplierFormDialogProps) {
  const [form, setForm] = React.useState<SupplierFormState>(emptySupplierForm())
  const [submitting, setSubmitting] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})

  React.useEffect(() => {
    if (!open) return
    setFieldErrors({})
    if (mode === "edit" && supplier) {
      setForm(supplierToForm(supplier))
    } else {
      setForm(emptySupplierForm())
    }
  }, [open, mode, supplier])

  function updateField<K extends keyof SupplierFormState>(key: K, value: SupplierFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    if (form.name.trim().length < 1) {
      toast.error("اسم المورد مطلوب")
      return
    }

    setSubmitting(true)
    setFieldErrors({})
    try {
      if (mode === "create" && onCreate) {
        await onCreate(formToCreatePayload(form))
      } else if (mode === "edit" && supplier && onUpdate) {
        await onUpdate(supplier.id, formToUpdatePayload(form))
      }
      onSaved?.()
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiRequestError && err.errors) {
        setFieldErrors(err.errors)
      }
      toast.error(mapSubmitError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === "create" ? "إضافة مورد جديد" : "تعديل المورد"
  const fieldError = (key: string) => fieldErrors[key]?.[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(92vh,720px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:max-w-[640px]"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-border/50 px-6 pb-4 pt-6">
            <DialogHeader className="space-y-2 text-right">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Truck className="size-5" />
                </span>
                <div className="flex-1">
                  <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
                  <DialogDescription className="text-xs">
                    <span className="text-destructive">*</span> اسم المورد حقل مطلوب.
                  </DialogDescription>
                </div>
                <button type="button" onClick={() => onOpenChange(false)} aria-label="إغلاق">
                  <X className="size-4" />
                </button>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <fieldset className="space-y-3 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold">معلومات المورد</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-name">اسم المورد *</Label>
                  <Input
                    id="supplier-name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    autoFocus
                  />
                  {fieldError("name") ? (
                    <p className="text-xs text-destructive">{fieldError("name")}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-code">الكود</Label>
                  <Input
                    id="supplier-code"
                    value={form.code}
                    onChange={(e) => updateField("code", e.target.value)}
                    dir="ltr"
                  />
                  {fieldError("code") ? (
                    <p className="text-xs text-destructive">{fieldError("code")}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-contact">الشخص المسؤول</Label>
                  <Input
                    id="supplier-contact"
                    value={form.contactPerson}
                    onChange={(e) => updateField("contactPerson", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                  <Label htmlFor="supplier-active">الحالة (فعال)</Label>
                  <Switch
                    id="supplier-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => updateField("isActive", v)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold">معلومات التواصل</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-phone">الهاتف</Label>
                  <Input
                    id="supplier-phone"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-secondary-phone">هاتف إضافي</Label>
                  <Input
                    id="supplier-secondary-phone"
                    value={form.secondaryPhone}
                    onChange={(e) => updateField("secondaryPhone", e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-whatsapp">واتساب</Label>
                  <Input
                    id="supplier-whatsapp"
                    value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-email">البريد الإلكتروني</Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    dir="ltr"
                  />
                  {fieldError("email") ? (
                    <p className="text-xs text-destructive">{fieldError("email")}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-address">العنوان</Label>
                  <Textarea
                    id="supplier-address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold">المالية والملاحظات</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="supplier-credit-limit">الحد الائتماني</Label>
                  <Input
                    id="supplier-credit-limit"
                    type="number"
                    step="0.01"
                    value={form.creditLimit}
                    onChange={(e) => updateField("creditLimit", e.target.value)}
                    dir="ltr"
                  />
                </div>
                {mode === "create" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="supplier-opening-balance">الرصيد الافتتاحي</Label>
                    <Input
                      id="supplier-opening-balance"
                      type="number"
                      step="0.01"
                      value={form.openingBalance}
                      onChange={(e) => updateField("openingBalance", e.target.value)}
                      dir="ltr"
                    />
                  </div>
                ) : null}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="supplier-notes">ملاحظات</Label>
                  <Textarea
                    id="supplier-notes"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </fieldset>
          </div>

          <div className="shrink-0 border-t border-border/50 px-6 py-4">
            <div className="flex gap-2">
              <Button type="submit" className="rounded-xl gap-2" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {mode === "create" ? "حفظ المورد" : "حفظ التعديلات"}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl gap-2" onClick={() => onOpenChange(false)}>
                <X className="size-4" />
                إلغاء
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
