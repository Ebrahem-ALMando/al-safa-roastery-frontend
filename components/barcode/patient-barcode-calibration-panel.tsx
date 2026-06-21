"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  DEFAULT_PATIENT_BARCODE_PRINT_CALIBRATION,
  PATIENT_BARCODE_CALIBRATION_PRESETS,
  XPRINTER_TUBE_30X10_PRESET,
  getPatientBarcodePrintCalibration,
  normalizePatientBarcodePrintCalibration,
  savePatientBarcodePrintCalibration,
  type PatientBarcodePrintCalibration,
} from "@/lib/patient-barcode-print-calibration"

type NumericField =
  | "barcodeWidthMm"
  | "barcodeHeightMm"
  | "offsetXmm"
  | "offsetYmm"
  | "textSizePx"
  | "barcodeScaleXPercent"

const NUMERIC_FIELDS: Record<
  NumericField,
  {
    label: string
    unit: string
    min: number
    max: number
    step: number
    hint?: string
  }
> = {
  barcodeWidthMm: {
    label: "عرض الباركود",
    unit: "مم",
    min: 10,
    max: 45,
    step: 0.5,
    hint: "يمكن تجاوز 30 مم للتجربة إذا كان الدرايفر يترك فراغات داخلية.",
  },
  barcodeHeightMm: { label: "ارتفاع الباركود", unit: "مم", min: 4, max: 9.5, step: 0.2 },
  offsetXmm: { label: "إزاحة أفقية", unit: "مم", min: -15, max: 15, step: 0.5 },
  offsetYmm: { label: "إزاحة عمودية", unit: "مم", min: -3, max: 3, step: 0.2 },
  barcodeScaleXPercent: {
    label: "تمدد أفقي للباركود",
    unit: "%",
    min: 80,
    max: 160,
    step: 5,
  },
  textSizePx: { label: "حجم النص", unit: "px", min: 5, max: 10, step: 1 },
}

function CalibrationNumberControl({
  field,
  value,
  onChange,
  disabled,
  hint,
}: {
  field: NumericField
  value: number
  onChange: (field: NumericField, value: number) => void
  disabled?: boolean
  hint?: string
}) {
  const meta = NUMERIC_FIELDS[field]

  const setClamped = (raw: number) => {
    const rounded =
      meta.step >= 1 ? Math.round(raw) : Math.round(raw / meta.step) * meta.step
    onChange(field, Math.min(meta.max, Math.max(meta.min, rounded)))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{meta.label}</Label>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            className="h-8 w-20 tabular-nums text-left"
            dir="ltr"
            min={meta.min}
            max={meta.max}
            step={meta.step}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              const n = Number.parseFloat(e.target.value)
              if (!Number.isNaN(n)) setClamped(n)
            }}
          />
          <span className="text-xs text-muted-foreground">{meta.unit}</span>
        </div>
      </div>
      <Slider
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={[value]}
        disabled={disabled}
        onValueChange={([v]) => setClamped(v)}
      />
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export type PatientBarcodeCalibrationPanelProps = {
  calibration: PatientBarcodePrintCalibration
  onChange: (calibration: PatientBarcodePrintCalibration) => void
  onReset: () => void
  onApplyXprinterPreset: () => void
  onSaveAsDefault: () => void
}

export function PatientBarcodeCalibrationPanel({
  calibration,
  onChange,
  onReset,
  onApplyXprinterPreset,
  onSaveAsDefault,
}: PatientBarcodeCalibrationPanelProps) {
  const c = normalizePatientBarcodePrintCalibration(calibration)

  const patch = (partial: Partial<PatientBarcodePrintCalibration>) => {
    onChange(normalizePatientBarcodePrintCalibration({ ...c, ...partial }))
  }

  const setNumeric = (field: NumericField, value: number) => {
    patch({ [field]: value } as Partial<PatientBarcodePrintCalibration>)
  }

  const applyPreset = (preset: PatientBarcodePrintCalibration) => {
    onChange(normalizePatientBarcodePrintCalibration(preset))
  }

  const textControlsDisabled = c.labelMode === "barcode-only"

  const isXprinterPreset =
    c.barcodeWidthMm === XPRINTER_TUBE_30X10_PRESET.barcodeWidthMm &&
    c.barcodeHeightMm === XPRINTER_TUBE_30X10_PRESET.barcodeHeightMm &&
    c.barcodeScaleXPercent === XPRINTER_TUBE_30X10_PRESET.barcodeScaleXPercent &&
    c.labelMode === XPRINTER_TUBE_30X10_PRESET.labelMode &&
    c.showText === XPRINTER_TUBE_30X10_PRESET.showText

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">الإعداد السريع</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={isXprinterPreset ? "default" : "outline"}
            size="sm"
            className="h-auto min-h-9 gap-1.5 rounded-lg py-1.5"
            onClick={onApplyXprinterPreset}
          >
            لصاقة أنبوب Xprinter 30×10
            <Badge variant="secondary" className="text-[10px] font-normal">
              الإعداد الناجح
            </Badge>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => applyPreset(PATIENT_BARCODE_CALIBRATION_PRESETS.fullFill)}
          >
            تعبئة كاملة
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => applyPreset(PATIENT_BARCODE_CALIBRATION_PRESETS.withCode)}
          >
            باركود مع كود
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => applyPreset(PATIENT_BARCODE_CALIBRATION_PRESETS.smaller)}
          >
            أصغر قليلاً
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={onSaveAsDefault}>
            اعتماد كافتراضي
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onReset}>
            إعادة ضبط المعايرة
          </Button>
        </div>
      </section>

      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">
            إعدادات متقدمة
          </AccordionTrigger>
          <AccordionContent className="space-y-5 pt-2 pb-0">
            <CalibrationNumberControl
              field="barcodeWidthMm"
              value={c.barcodeWidthMm}
              onChange={setNumeric}
              hint={NUMERIC_FIELDS.barcodeWidthMm.hint}
            />
            <CalibrationNumberControl
              field="barcodeHeightMm"
              value={c.barcodeHeightMm}
              onChange={setNumeric}
            />
            <CalibrationNumberControl
              field="barcodeScaleXPercent"
              value={c.barcodeScaleXPercent}
              onChange={setNumeric}
            />
            <CalibrationNumberControl field="offsetXmm" value={c.offsetXmm} onChange={setNumeric} />
            <CalibrationNumberControl field="offsetYmm" value={c.offsetYmm} onChange={setNumeric} />

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="show-barcode-text" className="text-sm font-medium">
                إظهار النص أسفل الباركود
              </Label>
              <Switch
                id="show-barcode-text"
                checked={c.showText}
                disabled={c.labelMode === "barcode-only"}
                onCheckedChange={(showText) => patch({ showText })}
              />
            </div>

            <CalibrationNumberControl
              field="textSizePx"
              value={c.textSizePx}
              onChange={setNumeric}
              disabled={textControlsDisabled || !c.showText}
            />

            <div className="space-y-3">
              <Label className="text-sm font-medium">نمط اللصاقة</Label>
              <RadioGroup
                value={c.labelMode}
                onValueChange={(v) => {
                  const labelMode = v as PatientBarcodePrintCalibration["labelMode"]
                  patch({
                    labelMode,
                    ...(labelMode === "barcode-only" ? { showText: false } : {}),
                  })
                }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="barcode-only" id="label-mode-only" className="shrink-0" />
                  <Label htmlFor="label-mode-only" className="cursor-pointer font-normal">
                    باركود فقط
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="barcode-with-code" id="label-mode-code" className="shrink-0" />
                  <Label htmlFor="label-mode-code" className="cursor-pointer font-normal">
                    باركود + كود المريض
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              ملاحظة: مقاس اللصاقة الحقيقي 30×10 مم، لكن يمكن رفع عرض الباركود فوق 30 مم للتجربة إذا كان
              تعريف الطابعة يترك فراغات داخلية.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function usePatientBarcodePrintCalibration() {
  const [calibration, setCalibration] = React.useState<PatientBarcodePrintCalibration>(
    DEFAULT_PATIENT_BARCODE_PRINT_CALIBRATION
  )
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setCalibration(getPatientBarcodePrintCalibration())
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    savePatientBarcodePrintCalibration(calibration)
  }, [calibration, hydrated])

  const reset = React.useCallback(() => {
    setCalibration({ ...XPRINTER_TUBE_30X10_PRESET })
  }, [])

  return { calibration, setCalibration, reset, hydrated }
}
