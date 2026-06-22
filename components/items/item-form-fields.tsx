"use client"

import { Package, Scale, Wheat } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  FormFieldIcon,
  FormSection,
} from "@/components/shared/forms/FormSection"
import {
  adminFormFieldErrorClass,
  adminFormInputClass,
  adminFormInputCompactClass,
  adminFormLabelClass,
  adminFormSwitchRowClass,
} from "@/components/shared/forms/administrative-form-styles"
import { ITEM_TYPE_LABELS_AR } from "@/features/items"
import type { CreateItemInput, Item, ItemType, UpdateItemInput } from "@/features/items"
import type { LucideIcon } from "lucide-react"

const ITEM_TYPE_OPTIONS: {
  value: ItemType
  label: string
  icon: LucideIcon
  selectedClass: string
  idleClass: string
  iconSelectedClass: string
  iconIdleClass: string
  focusRingClass: string
}[] = [
  {
    value: "raw",
    label: ITEM_TYPE_LABELS_AR.raw,
    icon: Wheat,
    selectedClass:
      "border-amber-500 bg-amber-500/12 text-amber-950 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-amber-400/45 hover:bg-amber-500/5",
    iconSelectedClass: "text-amber-600 dark:text-amber-300",
    iconIdleClass: "text-amber-600/80",
    focusRingClass: "focus-visible:ring-amber-500/40",
  },
  {
    value: "ready",
    label: ITEM_TYPE_LABELS_AR.ready,
    icon: Package,
    selectedClass:
      "border-sky-500 bg-sky-500/12 text-sky-950 dark:border-sky-400 dark:bg-sky-500/15 dark:text-sky-50",
    idleClass:
      "border-border/50 bg-muted/20 text-foreground/80 hover:border-sky-400/45 hover:bg-sky-500/5",
    iconSelectedClass: "text-sky-600 dark:text-sky-300",
    iconIdleClass: "text-sky-600/80",
    focusRingClass: "focus-visible:ring-sky-500/40",
  },
]

export type ItemFormState = {
  name: string
  itemType: ItemType
  minimumQuantityKg: string
  autoCreateDefaultProduct: boolean
  notes: string
  isActive: boolean
}

export function emptyItemForm(): ItemFormState {
  return {
    name: "",
    itemType: "raw",
    minimumQuantityKg: "",
    autoCreateDefaultProduct: false,
    notes: "",
    isActive: true,
  }
}

export function itemToForm(item: Item): ItemFormState {
  return {
    name: item.name ?? "",
    itemType: item.item_type ?? "raw",
    minimumQuantityKg:
      item.minimum_quantity_kg != null ? String(item.minimum_quantity_kg) : "",
    autoCreateDefaultProduct: false,
    notes: item.notes ?? "",
    isActive: item.is_active,
  }
}

export function formToCreatePayload(form: ItemFormState): CreateItemInput {
  const payload: CreateItemInput = {
    name: form.name.trim(),
    item_type: form.itemType,
    is_active: form.isActive,
  }
  if (form.minimumQuantityKg.trim()) {
    const n = Number.parseFloat(form.minimumQuantityKg)
    if (Number.isFinite(n)) payload.minimum_quantity_kg = n
  }
  if (form.itemType === "ready" && form.autoCreateDefaultProduct) {
    payload.auto_create_default_product = true
  }
  if (form.notes.trim()) payload.notes = form.notes.trim()
  return payload
}

export function formToUpdatePayload(form: ItemFormState): UpdateItemInput {
  const payload: UpdateItemInput = {
    name: form.name.trim(),
    item_type: form.itemType,
    notes: form.notes.trim() || null,
    is_active: form.isActive,
  }
  if (form.minimumQuantityKg.trim()) {
    const n = Number.parseFloat(form.minimumQuantityKg)
    payload.minimum_quantity_kg = Number.isFinite(n) ? n : null
  } else {
    payload.minimum_quantity_kg = null
  }
  return payload
}

type ItemFormFieldsProps = {
  form: ItemFormState
  onChange: (next: ItemFormState) => void
  idPrefix: string
  mode: "create" | "edit"
  item?: Item | null
  fieldErrors?: Record<string, string[]>
  nameFieldAutoFocus?: boolean
  formKey?: string
}

function fieldError(errors: Record<string, string[]> | undefined, key: string): string | undefined {
  return errors?.[key]?.[0]
}

export function ItemFormFields({
  form,
  onChange,
  idPrefix,
  mode,
  item,
  fieldErrors,
  nameFieldAutoFocus,
}: ItemFormFieldsProps) {
  const set = (patch: Partial<ItemFormState>) => onChange({ ...form, ...patch })

  return (
    <div className="space-y-3.5">
      <FormSection icon={Package} title="معلومات الصنف">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:items-start">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-name`} className={adminFormLabelClass}>
              اسم الصنف <span className="text-destructive">*</span>
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <Package className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-name`}
                name="name"
                value={form.name}
                onChange={(ev) => set({ name: ev.target.value })}
                autoFocus={nameFieldAutoFocus}
                placeholder="مثال: فستق حلبي"
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
              نوع الصنف <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="نوع الصنف">
              {ITEM_TYPE_OPTIONS.map((option) => {
                const selected = form.itemType === option.value
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    id={`${idPrefix}-itemType-${option.value}`}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => set({ itemType: option.value })}
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
            {fieldError(fieldErrors, "item_type") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "item_type")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-minimumQuantity`} className={adminFormLabelClass}>
              الحد الأدنى للكمية (كغ)
            </Label>
            <div className="relative w-full min-w-0">
              <FormFieldIcon>
                <Scale className="size-4" />
              </FormFieldIcon>
              <Input
                id={`${idPrefix}-minimumQuantity`}
                name="minimumQuantityKg"
                inputMode="decimal"
                value={form.minimumQuantityKg}
                onChange={(ev) => set({ minimumQuantityKg: ev.target.value })}
                placeholder="مثال: 10.000"
                className={adminFormInputCompactClass}
                dir="ltr"
              />
            </div>
            {fieldError(fieldErrors, "minimum_quantity_kg") ? (
              <p className={adminFormFieldErrorClass} role="alert">
                {fieldError(fieldErrors, "minimum_quantity_kg")}
              </p>
            ) : null}
          </div>

          {mode === "create" && form.itemType === "ready" ? (
            <div className={cn(adminFormSwitchRowClass)}>
              <Label htmlFor={`${idPrefix}-autoProduct`} className={adminFormLabelClass}>
                إنشاء منتج افتراضي تلقائياً
              </Label>
              <Switch
                id={`${idPrefix}-autoProduct`}
                checked={form.autoCreateDefaultProduct}
                onCheckedChange={(c) => set({ autoCreateDefaultProduct: Boolean(c) })}
              />
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

          {mode === "edit" && item ? (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className={adminFormLabelClass}>الكود</Label>
                <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm font-mono" dir="ltr">
                  {item.code || "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className={adminFormLabelClass}>الكمية الحالية</Label>
                <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm" dir="ltr">
                  {item.current_quantity_kg != null ? String(item.current_quantity_kg) : "—"} كغ
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className={adminFormLabelClass}>متوسط التكلفة</Label>
                <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm" dir="ltr">
                  {item.average_cost != null ? String(item.average_cost) : "—"} USD / كغ
                </p>
              </div>
            </>
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
              placeholder="أدخل أي ملاحظات إضافية عن الصنف (اختياري)"
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
