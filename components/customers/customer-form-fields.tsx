"use client"

import { useEffect, useRef } from "react"
import {
  Car,
  CircleUserRound,
  DollarSign,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
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
  adminFormSwitchRowClass,
  adminFormTextareaClass,
} from "@/components/shared/forms/administrative-form-styles"
import { CUSTOMER_TYPE_LABELS_AR, formatOpeningBalanceSummary } from "@/features/customers"
import type {
  CreateCustomerInput,
  Customer,
  CustomerType,
  UpdateCustomerInput,
} from "@/features/customers"
import type { LucideIcon } from "lucide-react"

const CUSTOMER_TYPE_OPTIONS: {
  value: CustomerType
  label: string
  icon: LucideIcon
  selectedClass: string
  idleClass: string
  iconSelectedClass: string
  iconIdleClass: string
  focusRingClass: string
}[] = [
  {
    value: "consumer",
    label: CUSTOMER_TYPE_LABELS_AR.consumer,
    icon: CircleUserRound,
    selectedClass:
      "border-emerald-500 bg-emerald-500/12 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-emerald-400/45 hover:bg-emerald-500/5",
    iconSelectedClass: "text-emerald-600 dark:text-emerald-300",
    iconIdleClass: "text-emerald-600/80",
    focusRingClass: "focus-visible:ring-emerald-500/40",
  },
  {
    value: "retail",
    label: CUSTOMER_TYPE_LABELS_AR.retail,
    icon: ShoppingBag,
    selectedClass:
      "border-sky-500 bg-sky-500/12 text-sky-900 dark:border-sky-400 dark:bg-sky-500/15 dark:text-sky-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-sky-400/45 hover:bg-sky-500/5",
    iconSelectedClass: "text-sky-600 dark:text-sky-300",
    iconIdleClass: "text-sky-600/80",
    focusRingClass: "focus-visible:ring-sky-500/40",
  },
  {
    value: "wholesale",
    label: CUSTOMER_TYPE_LABELS_AR.wholesale,
    icon: Package,
    selectedClass:
      "border-violet-500 bg-violet-500/12 text-violet-950 dark:border-violet-400 dark:bg-violet-500/15 dark:text-violet-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-violet-400/45 hover:bg-violet-500/5",
    iconSelectedClass: "text-violet-600 dark:text-violet-300",
    iconIdleClass: "text-violet-600/80",
    focusRingClass: "focus-visible:ring-violet-500/40",
  },
  {
    value: "car",
    label: CUSTOMER_TYPE_LABELS_AR.car,
    icon: Car,
    selectedClass:
      "border-amber-500 bg-amber-500/12 text-amber-950 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-amber-400/45 hover:bg-amber-500/5",
    iconSelectedClass: "text-amber-600 dark:text-amber-300",
    iconIdleClass: "text-amber-600/80",
    focusRingClass: "focus-visible:ring-amber-500/40",
  },
]

export type OpeningBalanceDirection = "customer_owes_us" | "customer_credit"

export type CustomerFormState = {
  name: string
  contactPerson: string
  customerType: CustomerType
  carNumber: string
  phone: string
  secondaryPhone: string
  whatsapp: string
  email: string
  address: string
  creditLimit: string
  openingBalanceAmount: string
  openingBalanceDirection: OpeningBalanceDirection
  notes: string
  isActive: boolean
}

export function emptyCustomerForm(): CustomerFormState {
  return {
    name: "",
    contactPerson: "",
    customerType: "consumer",
    carNumber: "",
    phone: "",
    secondaryPhone: "",
    whatsapp: "",
    email: "",
    address: "",
    creditLimit: "",
    openingBalanceAmount: "0",
    openingBalanceDirection: "customer_owes_us",
    notes: "",
    isActive: true,
  }
}

export function customerToForm(customer: Customer): CustomerFormState {
  return {
    name: customer.name ?? "",
    contactPerson: customer.contact_person ?? "",
    customerType: customer.customer_type ?? "consumer",
    carNumber: customer.car_number ?? "",
    phone: customer.phone ?? "",
    secondaryPhone: customer.secondary_phone ?? "",
    whatsapp: customer.whatsapp ?? "",
    email: customer.email ?? "",
    address: customer.address ?? "",
    creditLimit: customer.credit_limit != null ? String(customer.credit_limit) : "",
    openingBalanceAmount: "0",
    openingBalanceDirection: "customer_owes_us",
    notes: customer.notes ?? "",
    isActive: customer.is_active,
  }
}

export function normalizeOpeningBalanceForApi(form: CustomerFormState): number {
  const amount = Math.abs(Number.parseFloat(form.openingBalanceAmount || "0") || 0)
  const sign = form.openingBalanceDirection === "customer_credit" ? -1 : 1
  return amount * sign
}

function showsContactPersonField(customerType: CustomerType): boolean {
  return customerType === "wholesale" || customerType === "car"
}

export function formToCreatePayload(form: CustomerFormState): CreateCustomerInput {
  const payload: CreateCustomerInput = {
    name: form.name.trim(),
    customer_type: form.customerType,
    is_active: form.isActive,
    opening_balance: normalizeOpeningBalanceForApi(form),
  }
  if (showsContactPersonField(form.customerType) && form.contactPerson.trim()) {
    payload.contact_person = form.contactPerson.trim()
  }
  if (form.customerType === "car") {
    payload.car_number = form.carNumber.trim()
  }
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
  return payload
}

export function formToUpdatePayload(form: CustomerFormState): UpdateCustomerInput {
  const payload: UpdateCustomerInput = {
    name: form.name.trim(),
    customer_type: form.customerType,
    contact_person: showsContactPersonField(form.customerType)
      ? form.contactPerson.trim() || null
      : null,
    car_number: form.customerType === "car" ? form.carNumber.trim() || null : null,
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

type CustomerFormFieldsProps = {
  form: CustomerFormState
  onChange: (next: CustomerFormState) => void
  idPrefix: string
  mode: "create" | "edit"
  customer?: Customer | null
  fieldErrors?: Record<string, string[]>
  nameFieldAutoFocus?: boolean
  formKey?: string
}

function fieldError(errors: Record<string, string[]> | undefined, key: string): string | undefined {
  return errors?.[key]?.[0]
}

function sanitizeOpeningAmount(value: string): string {
  return value.replace(/[^\d.,]/g, "").replace(/-/g, "")
}

export function CustomerFormFields({
  form,
  onChange,
  idPrefix,
  mode,
  customer,
  fieldErrors,
  nameFieldAutoFocus,
  formKey,
}: CustomerFormFieldsProps) {
  const set = (patch: Partial<CustomerFormState>) => onChange({ ...form, ...patch })
  const whatsappLinkedToPhoneRef = useRef(true)

  useEffect(() => {
    whatsappLinkedToPhoneRef.current =
      !form.whatsapp.trim() || form.whatsapp.trim() === form.phone.trim()
  }, [formKey])

  const handlePhoneChange = (phone: string) => {
    if (whatsappLinkedToPhoneRef.current) {
      set({ phone, whatsapp: phone })
    } else {
      set({ phone })
    }
  }

  const handleWhatsappChange = (whatsapp: string) => {
    whatsappLinkedToPhoneRef.current = whatsapp.trim() === form.phone.trim()
    set({ whatsapp })
  }

  return (
    <div className="space-y-3.5">
      <FormSection icon={CircleUserRound} title="معلومات الزبون">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:items-start">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-name`} className={adminFormLabelClass}>
              اسم الزبون <span className="text-destructive">*</span>
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
                placeholder="مثال: أحمد محمد"
                className={adminFormInputClass}
              />
            </div>
            {fieldError(fieldErrors, "name") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "name")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className={adminFormLabelClass}>
              نوع الزبون <span className="text-destructive">*</span>
            </Label>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              role="radiogroup"
              aria-label="نوع الزبون"
            >
              {CUSTOMER_TYPE_OPTIONS.map((option) => {
                const selected = form.customerType === option.value
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    id={`${idPrefix}-customerType-${option.value}`}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => set({ customerType: option.value })}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-3 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      option.focusRingClass,
                      selected ? option.selectedClass : option.idleClass
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        selected ? option.iconSelectedClass : option.iconIdleClass
                      )}
                      aria-hidden
                    />
                    {option.label}
                  </button>
                )
              })}
            </div>
            {fieldError(fieldErrors, "customer_type") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "customer_type")}
              </p>
            ) : null}
          </div>

          {form.customerType === "car" ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-carNumber`} className={adminFormLabelClass}>
                رقم السيارة <span className="text-destructive">*</span>
              </Label>
              <div className="relative w-full min-w-0">
                <FormFieldIcon>
                  <Car className="size-4" />
                </FormFieldIcon>
                <Input
                  id={`${idPrefix}-carNumber`}
                  name="carNumber"
                  value={form.carNumber}
                  onChange={(ev) => set({ carNumber: ev.target.value })}
                  placeholder="مثال: 12345"
                  className={adminFormInputClass}
                  dir="ltr"
                />
              </div>
              {fieldError(fieldErrors, "car_number") ? (
                <p className={adminFormFieldErrorClass} role="alert">
                  {fieldError(fieldErrors, "car_number")}
                </p>
              ) : null}
            </div>
          ) : null}

          {showsContactPersonField(form.customerType) ? (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-contact`} className={adminFormLabelClass}>
                اسم جهة الاتصال داخل المنشأة (اختياري)
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
          ) : null}

          <div className={cn(adminFormSwitchRowClass, "sm:col-span-2")}>
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
                onChange={(ev) => handlePhoneChange(ev.target.value)}
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
                onChange={(ev) => handleWhatsappChange(ev.target.value)}
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
                placeholder="أدخل عنوان الزبون (اختياري)"
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
              <div className="flex items-stretch gap-2">
                <div className="relative min-w-0 flex-1">
                  <FormFieldIcon>
                    <DollarSign className="size-4" />
                  </FormFieldIcon>
                  <Input
                    id={`${idPrefix}-openingBalance`}
                    name="openingBalanceAmount"
                    inputMode="decimal"
                    min={0}
                    value={form.openingBalanceAmount}
                    onChange={(ev) =>
                      set({ openingBalanceAmount: sanitizeOpeningAmount(ev.target.value) })
                    }
                    placeholder="مثال: 0.00"
                    className={adminFormInputCompactClass}
                    dir="ltr"
                  />
                </div>
                <div
                  className="inline-flex shrink-0 overflow-hidden rounded-lg border border-border/60"
                  role="group"
                  aria-label="اتجاه الرصيد الافتتاحي"
                >
                  {(
                    [
                      { value: "customer_owes_us", label: "عليه لنا" },
                      { value: "customer_credit", label: "له عندنا" },
                    ] as const
                  ).map((option) => {
                    const selected = form.openingBalanceDirection === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "min-w-14 px-2 py-2 text-xs font-medium transition-colors sm:min-w-16 sm:text-sm",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted/60"
                        )}
                        onClick={() => set({ openingBalanceDirection: option.value })}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              {fieldError(fieldErrors, "opening_balance") ? (
                <p className={adminFormFieldErrorClass} role="alert">
                  {fieldError(fieldErrors, "opening_balance")}
                </p>
              ) : null}
            </div>
          ) : customer ? (
            <div className="space-y-1.5">
              <Label className={adminFormLabelClass}>الرصيد الافتتاحي</Label>
              <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm" dir="ltr">
                {formatOpeningBalanceSummary(customer.opening_balance)}
              </p>
            </div>
          ) : null}

          <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">
            ملاحظة: «عليه لنا» يعني أن الزبون مدين لكم، و«له عندنا» يعني أن لديه رصيد دائن عندكم.
          </p>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-notes`} className={adminFormLabelClass}>
              ملاحظات
            </Label>
            <Textarea
              id={`${idPrefix}-notes`}
              name="notes"
              value={form.notes}
              onChange={(ev) => set({ notes: ev.target.value })}
              placeholder="أدخل أي ملاحظات إضافية عن الزبون (اختياري)"
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
