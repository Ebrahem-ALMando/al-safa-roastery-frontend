"use client"

import { CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { LabOrderItemTestField } from "@/features/orders"
import { parseSelectOptions } from "@/features/results"
import { getFieldInputType } from "@/features/tests"
import { cn } from "@/lib/utils"

const entryControlShellClass = "w-full min-w-0"

type ResultEntryFieldInputProps = {
  field: LabOrderItemTestField
  value: string
  onChange: (value: string) => void
  disabled: boolean
  highlightClass?: string
}

export function ResultEntryFieldInput({
  field,
  value,
  onChange,
  disabled,
  highlightClass,
}: ResultEntryFieldInputProps) {
  const inputType = getFieldInputType(field)
  const options = parseSelectOptions(field.select_options)

  if (inputType === "number") {
    return (
      <div className={cn(entryControlShellClass, "flex items-center gap-2")}>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          className={cn(
            "h-10 min-w-0 flex-1 rounded-xl text-center font-mono text-sm transition-colors",
            highlightClass
          )}
          dir="ltr"
          disabled={disabled}
          placeholder="—"
        />
        {field.unit ? (
          <span
            className="shrink-0 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            dir="ltr"
          >
            {field.unit}
          </span>
        ) : null}
      </div>
    )
  }

  if (inputType === "textarea") {
    return (
      <div className={entryControlShellClass}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="min-h-[72px] w-full resize-y rounded-xl text-sm leading-relaxed tracking-normal [font-family:var(--font-tajawal),ui-sans-serif,system-ui,sans-serif]"
          dir="rtl"
          disabled={disabled}
          placeholder="أدخل النص"
        />
      </div>
    )
  }

  if (inputType === "text") {
    return (
      <div className={entryControlShellClass}>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 w-full rounded-xl text-sm text-right leading-relaxed tracking-normal [font-family:var(--font-tajawal),ui-sans-serif,system-ui,sans-serif]",
            highlightClass
          )}
          dir="auto"
          disabled={disabled}
          placeholder="أدخل القيمة"
        />
      </div>
    )
  }

  if (inputType === "radio") {
    return (
      <div className={entryControlShellClass}>
        <RadioGroup
          value={value}
          onValueChange={onChange}
          disabled={disabled || options.length === 0}
          className="flex w-full flex-wrap gap-x-3 gap-y-2 rounded-xl border border-border/50 bg-background/60 p-2.5"
        >
          {options.map((option) => {
            const id = `field-${field.id}-${option.value}`

            return (
              <div key={option.value} className="flex items-center gap-1.5">
                <RadioGroupItem value={option.value} id={id} />
                <Label htmlFor={id} className="cursor-pointer text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    {option.is_normal ? (
                      <CheckCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : null}
                    {option.label}
                  </span>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </div>
    )
  }

  return (
    <div className={entryControlShellClass}>
      <Select
        dir="rtl"
        value={value}
        onValueChange={onChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger className={cn("h-10 w-full rounded-xl", highlightClass)}>
          <SelectValue placeholder={options.length ? "اختر النتيجة" : "لا خيارات"} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                {option.is_normal ? (
                  <CheckCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : null}
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
