"use client"

import type { Dispatch, SetStateAction } from "react"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Test } from "@/features/tests"
import type { Category } from "@/features/categories"
import { cn } from "@/lib/utils"

export type TestFormState = {
  categoryId: string
  name: string
  code: string
  iconName: string
  notes: string
  isActive: boolean
}

export function emptyTestForm(): TestFormState {
  return {
    categoryId: "",
    name: "",
    code: "",
    iconName: "",
    notes: "",
    isActive: true,
  }
}

export function testToForm(test: Test): TestFormState {
  return {
    categoryId: String(test.category_id),
    name: test.name,
    code: test.code,
    iconName: test.icon_name ?? "",
    notes: test.notes ?? "",
    isActive: test.is_active,
  }
}

export function TestFormFields(props: {
  form: TestFormState
  setForm: Dispatch<SetStateAction<TestFormState>>
  categories: Category[]
  categoriesLoading: boolean
  categoryQuery: string
  setCategoryQuery: (q: string) => void
  disabled?: boolean
  idPrefix: string
}) {
  const {
    form,
    setForm,
    categories,
    categoriesLoading,
    categoryQuery,
    setCategoryQuery,
    disabled,
    idPrefix,
  } = props

  return (
    <div className="grid gap-4 sm:grid-cols-1">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-cat-q`} className="text-muted-foreground">
          التصنيف
        </Label>
        <Input
          id={`${idPrefix}-cat-q`}
          placeholder="بحث في التصنيفات..."
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          disabled={disabled}
        />
        <Select
          value={form.categoryId}
          onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
          disabled={disabled || categoriesLoading}
        >
          <SelectTrigger id={`${idPrefix}-cat`} className="h-10 w-full">
            <div className="flex items-center gap-2">
              {categoriesLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              ) : null}
              <SelectValue placeholder="اختر التصنيف" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-name`}>اسم الفحص</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          disabled={disabled}
          className="h-10"
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-code`} className="text-muted-foreground">
          كود الفحص (فريد)
        </Label>
        <Input
          id={`${idPrefix}-code`}
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          dir="ltr"
          disabled={disabled}
          className="h-10 font-mono"
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-icon`}>أيقونة (اختياري)</Label>
        <Input
          id={`${idPrefix}-icon`}
          value={form.iconName}
          onChange={(e) => setForm((f) => ({ ...f, iconName: e.target.value }))}
          disabled={disabled}
          placeholder="مثال: droplet"
          className="h-10"
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-notes`}>ملاحظات</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          disabled={disabled}
          rows={3}
          className="resize-none"
        />
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2 sm:col-span-2"
        )}
      >
        <div className="text-right">
          <p className="text-sm font-medium">حالة التفعيل</p>
          <p className="text-xs text-muted-foreground">إظهار الفحص في القوائم عند التفعيل</p>
        </div>
        <Switch
          checked={form.isActive}
          onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: c }))}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export function formToCreatePayload(form: TestFormState) {
  const category_id = Number(form.categoryId)
  return {
    category_id,
    name: form.name.trim(),
    code: form.code.trim(),
    icon_name: form.iconName.trim() || null,
    notes: form.notes.trim() || null,
    is_active: form.isActive,
  }
}

export function formToUpdatePayload(form: TestFormState) {
  return {
    category_id: Number(form.categoryId),
    name: form.name.trim(),
    code: form.code.trim(),
    icon_name: form.iconName.trim() || null,
    notes: form.notes.trim() || null,
    is_active: form.isActive,
  }
}
