"use client"

import {
  CircleUserRound,
  DollarSign,
  Hash,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  FormFieldIcon,
  FormSection,
  FormTextareaIcon,
} from "@/components/shared/forms/FormSection"
import {
  adminFormFieldErrorClass,
  adminFormInputClass,
  adminFormInputCompactClass,
  adminFormLabelClass,
  adminFormReadOnlyInputClass,
  adminFormSwitchRowClass,
  adminFormTextareaClass,
} from "@/components/shared/forms/administrative-form-styles"
import type { CreateSupplierInput, Supplier, UpdateSupplierInput } from "@/features/suppliers"

export type SupplierFormState = {
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

export function supplierToForm(supplier: Supplier): SupplierFormState {
  return {
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

/** Create payload — code is omitted; backend generates it automatically. */
export function formToCreatePayload(form: SupplierFormState): CreateSupplierInput {
  const payload: CreateSupplierInput = {
    name: form.name.trim(),
    is_active: form.isActive,
  }
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

/** Update payload — code is never sent; it cannot be changed from the UI. */
export function formToUpdatePayload(form: SupplierFormState): UpdateSupplierInput {
  const payload: UpdateSupplierInput = {
    name: form.name.trim(),
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

type SupplierFormFieldsProps = {
  form: SupplierFormState
  onChange: (next: SupplierFormState) => void
  idPrefix: string
  mode: "create" | "edit"
  /** Read-only supplier code shown in edit mode only. */
  supplierCode?: string | null
  fieldErrors?: Record<string, string[]>
  nameFieldAutoFocus?: boolean
}

function fieldError(errors: Record<string, string[]> | undefined, key: string): string | undefined {
  return errors?.[key]?.[0]
}

export function SupplierFormFields({
  form,
  onChange,
  idPrefix,
  mode,
  supplierCode,
  fieldErrors,
  nameFieldAutoFocus,
}: SupplierFormFieldsProps) {
  const set = (patch: Partial<SupplierFormState>) => onChange({ ...form, ...patch })

  return (
    <div className="space-y-3.5">
      <FormSection icon={CircleUserRound} title="معلومات المورد">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:items-start">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-name`} className={adminFormLabelClass}>
              اسم المورد <span className="text-destructive">*</span>
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <User className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-name`}
                name="name"
                value={form.name}
                onChange={(ev) => set({ name: ev.target.value })}
                autoFocus={nameFieldAutoFocus}
                placeholder="مثال: شركة النخبة للتوريدات"
                className={adminFormInputClass}
              />
            </div>
            {fieldError(fieldErrors, "name") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "name")}
              </p>
            ) : null}
          </div>

          {mode === "edit" && supplierCode ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-code`} className={adminFormLabelClass}>
                كود المورد
              </Label>
              <div className="relative w-full min-w-0">
                <FormFieldIcon>
                  <Hash className="size-4" />
                </FormFieldIcon>
                <Input
                  id={`${idPrefix}-code`}
                  value={supplierCode}
                  readOnly
                  disabled
                  tabIndex={-1}
                  className={`${adminFormReadOnlyInputClass} ps-10`}
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                يُولَّد الكود تلقائياً ولا يمكن تعديله.
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-contact`} className={adminFormLabelClass}>
              الشخص المسؤول
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <User className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-contact`}
                name="contactPerson"
                value={form.contactPerson}
                onChange={(ev) => set({ contactPerson: ev.target.value })}
                placeholder="مثال: أحمد محمد"
                className={adminFormInputClass}
              />
            </div>
          </div>

          <div className={adminFormSwitchRowClass}>
            <Label htmlFor={`${idPrefix}-isActive`} className={adminFormLabelClass}>
              الحالة (فعال)
            </Label>
            <Switch
              id={`${idPrefix}-isActive`}
              checked={form.isActive}
              onCheckedChange={(c) => set({ isActive: Boolean(c) })}
            />
          </div>
        </div>
      </FormSection>

      <FormSection icon={Phone} title="معلومات التواصل">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-phone`} className={adminFormLabelClass}>
              الهاتف
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <Phone className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-phone`}
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(ev) => set({ phone: ev.target.value })}
                autoComplete="tel"
                placeholder="05XXXXXXXX"
                className={adminFormInputCompactClass}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-secondaryPhone`} className={adminFormLabelClass}>
              هاتف إضافي
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <Phone className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-secondaryPhone`}
                name="secondaryPhone"
                type="tel"
                value={form.secondaryPhone}
                onChange={(ev) => set({ secondaryPhone: ev.target.value })}
                placeholder="05XXXXXXXX"
                className={adminFormInputCompactClass}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-whatsapp`} className={adminFormLabelClass}>
              واتساب
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <MessageCircle className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-whatsapp`}
                name="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={(ev) => set({ whatsapp: ev.target.value })}
                placeholder="05XXXXXXXX"
                className={adminFormInputCompactClass}
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-email`} className={adminFormLabelClass}>
              البريد الإلكتروني
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <Mail className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-email`}
                name="email"
                type="email"
                value={form.email}
                onChange={(ev) => set({ email: ev.target.value })}
                autoComplete="email"
                placeholder="example@email.com"
                className={adminFormInputCompactClass}
                dir="ltr"
              />
            </div>
            {fieldError(fieldErrors, "email") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "email")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-address`} className={adminFormLabelClass}>
              العنوان
            </Label>
            <div className="relative w-full min-w-0">
              <FormTextareaIcon>
                <MapPin className="size-4" />
              </FormTextareaIcon>
              <Textarea
                id={`${idPrefix}-address`}
                name="address"
                value={form.address}
                onChange={(ev) => set({ address: ev.target.value })}
                autoComplete="street-address"
                placeholder="أدخل عنوان المورد (اختياري)"
                className={adminFormTextareaClass}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection icon={DollarSign} title="المعلومات المالية والملاحظات">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-creditLimit`} className={adminFormLabelClass}>
              الحد الائتماني
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <DollarSign className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-creditLimit`}
                name="creditLimit"
                inputMode="decimal"
                value={form.creditLimit}
                onChange={(ev) => set({ creditLimit: ev.target.value })}
                placeholder="مثال: 5,000"
                className={adminFormInputCompactClass}
                dir="ltr"
              />
            </div>
            {fieldError(fieldErrors, "credit_limit") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "credit_limit")}
              </p>
            ) : null}
          </div>

          {mode === "create" ? (
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-openingBalance`} className={adminFormLabelClass}>
                الرصيد الافتتاحي
              </Label>
              <div className="relative w-full min-w-0">
                <FormFieldIcon>
                  <DollarSign className="size-4" />
                </FormFieldIcon>
                <Input
                  id={`${idPrefix}-openingBalance`}
                  name="openingBalance"
                  inputMode="decimal"
                  value={form.openingBalance}
                  onChange={(ev) => set({ openingBalance: ev.target.value })}
                  placeholder="مثال: 0.00"
                  className={adminFormInputCompactClass}
                  dir="ltr"
                />
              </div>
              {fieldError(fieldErrors, "opening_balance") ? (
                <p className={adminFormFieldErrorClass} role="alert">
                  {fieldError(fieldErrors, "opening_balance")}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-notes`} className={adminFormLabelClass}>
              ملاحظات
            </Label>
            <Textarea
              id={`${idPrefix}-notes`}
              name="notes"
              value={form.notes}
              onChange={(ev) => set({ notes: ev.target.value })}
              placeholder="أدخل أي ملاحظات إضافية عن المورد (اختياري)"
              className="min-h-[80px] rounded-lg"
            />
            {fieldError(fieldErrors, "notes") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "notes")}
              </p>
            ) : null}
          </div>
        </div>
      </FormSection>
    </div>
  )
}
