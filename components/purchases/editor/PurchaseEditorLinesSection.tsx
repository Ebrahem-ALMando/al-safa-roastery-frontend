"use client"

import * as React from "react"
import { Package, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ItemTypeBadge } from "@/components/items/item-type-badge"
import {
  calculateLineTotal,
  createEditorLineFromItem,
  formatUsd,
  PURCHASE_MESSAGES,
} from "@/features/purchases"
import type { PurchaseEditorLine } from "@/features/purchases/types/purchase-editor.types"
import type { ItemPickerRow } from "@/features/purchases/hooks/useItemPickerList"
import type { Item } from "@/features/items/types/item.types"
import { ItemPickerDialog } from "./ItemPickerDialog"

type PurchaseEditorLinesSectionProps = {
  lines: PurchaseEditorLine[]
  onChange: (lines: PurchaseEditorLine[]) => void
  fieldErrors: Record<string, string | undefined>
  disabled?: boolean
}

function pickerRowToItem(row: ItemPickerRow): Item {
  return {
    id: Number.parseInt(row.id, 10),
    name: row.name,
    code: row.code === "—" ? null : row.code,
    item_type: row.itemType,
    unit: null,
    current_quantity_kg: row.currentQuantityKg,
    average_cost: row.averageCost,
    last_purchase_price: null,
    minimum_quantity_kg: null,
    auto_create_default_product: false,
    is_active: true,
    notes: null,
    last_activity: null,
    created_at: null,
    updated_at: null,
  }
}

export function PurchaseEditorLinesSection({
  lines,
  onChange,
  fieldErrors,
  disabled = false,
}: PurchaseEditorLinesSectionProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const lineRefs = React.useRef<Record<string, HTMLTableRowElement | null>>({})

  const excludeIds = lines.map((l) => l.itemId)

  function handleAddItem(row: ItemPickerRow) {
    const itemId = Number.parseInt(row.id, 10)
    const existing = lines.find((l) => l.itemId === itemId)
    if (existing) {
      toast.info(PURCHASE_MESSAGES.duplicateItem)
      const el = lineRefs.current[existing.key]
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      onChange(
        lines.map((l) =>
          l.key === existing.key ? { ...l, highlight: true } : { ...l, highlight: false }
        )
      )
      window.setTimeout(() => {
        onChange(lines.map((l) => ({ ...l, highlight: l.key === existing.key ? false : l.highlight })))
      }, 1500)
      return
    }
    onChange([...lines, createEditorLineFromItem(pickerRowToItem(row))])
  }

  function updateLine(key: string, patch: Partial<PurchaseEditorLine>) {
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  function removeLine(key: string) {
    onChange(lines.filter((l) => l.key !== key))
  }

  return (
    <>
      <ItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddItem}
        excludeItemIds={excludeIds}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="size-5 text-primary" />
              أصناف الفاتورة
            </CardTitle>
            <CardDescription>
              أضف الأصناف التي تم شراؤها من المورد، وحدد الكمية وسعر الكيلو لكل صنف.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="gap-2 rounded-xl"
            disabled={disabled}
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="size-4" />
            إضافة صنف
          </Button>
        </CardHeader>
        <CardContent>
          {fieldErrors.lines ? (
            <p className="mb-3 text-[11px] font-medium text-destructive" role="alert">
              {fieldErrors.lines}
            </p>
          ) : null}

          {lines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-10 text-center">
              <p className="font-semibold">لم تتم إضافة أصناف إلى الفاتورة بعد.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ابدأ باختيار صنف لإضافته إلى الفاتورة.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الصنف</TableHead>
                      <TableHead className="w-[120px] text-right">الكمية (كغ)</TableHead>
                      <TableHead className="w-[120px] text-right">سعر الكيلو</TableHead>
                      <TableHead className="w-[120px] text-right">الإجمالي</TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => {
                      const lineTotal = calculateLineTotal(line.quantityKg, line.unitPrice)
                      const qtyError = fieldErrors[`lines.${index}.quantity_kg`]
                      const priceError = fieldErrors[`lines.${index}.unit_price`]
                      return (
                        <TableRow
                          key={line.key}
                          ref={(el) => {
                            lineRefs.current[line.key] = el
                          }}
                          className={cn(
                            line.highlight && "bg-amber-50/80 ring-2 ring-amber-400/50 dark:bg-amber-950/30"
                          )}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">{line.itemName}</p>
                                <ItemTypeBadge itemType={line.itemType} />
                              </div>
                              <p className="text-xs text-muted-foreground" dir="ltr">
                                {line.itemCode ?? "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              inputMode="decimal"
                              value={line.quantityKg}
                              disabled={disabled}
                              onChange={(e) => updateLine(line.key, { quantityKg: e.target.value })}
                              className={cn("h-9 tabular-nums", qtyError && "border-destructive/60")}
                              dir="ltr"
                            />
                            {qtyError ? (
                              <p className="mt-1 text-[10px] text-destructive">{qtyError}</p>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Input
                              inputMode="decimal"
                              value={line.unitPrice}
                              disabled={disabled}
                              onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
                              className={cn("h-9 tabular-nums", priceError && "border-destructive/60")}
                              dir="ltr"
                            />
                            {priceError ? (
                              <p className="mt-1 text-[10px] text-destructive">{priceError}</p>
                            ) : null}
                          </TableCell>
                          <TableCell className="tabular-nums font-semibold" dir="ltr">
                            {formatUsd(lineTotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={disabled}
                              onClick={() => removeLine(line.key)}
                              className="text-destructive hover:bg-destructive/10"
                              aria-label="حذف الصنف"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {lines.map((line, index) => {
                  const lineTotal = calculateLineTotal(line.quantityKg, line.unitPrice)
                  const qtyError = fieldErrors[`lines.${index}.quantity_kg`]
                  const priceError = fieldErrors[`lines.${index}.unit_price`]
                  return (
                    <div
                      key={line.key}
                      ref={(el) => {
                        lineRefs.current[line.key] = el as unknown as HTMLTableRowElement
                      }}
                      className={cn(
                        "rounded-2xl border border-border/60 p-4",
                        line.highlight && "ring-2 ring-amber-400/50"
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{line.itemName}</p>
                            <ItemTypeBadge itemType={line.itemType} />
                          </div>
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            {line.itemCode ?? "—"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={disabled}
                          onClick={() => removeLine(line.key)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">الكمية (كغ)</p>
                          <Input
                            inputMode="decimal"
                            value={line.quantityKg}
                            disabled={disabled}
                            onChange={(e) => updateLine(line.key, { quantityKg: e.target.value })}
                            className="tabular-nums"
                            dir="ltr"
                          />
                          {qtyError ? (
                            <p className="mt-1 text-[10px] text-destructive">{qtyError}</p>
                          ) : null}
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">سعر الكيلو</p>
                          <Input
                            inputMode="decimal"
                            value={line.unitPrice}
                            disabled={disabled}
                            onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
                            className="tabular-nums"
                            dir="ltr"
                          />
                          {priceError ? (
                            <p className="mt-1 text-[10px] text-destructive">{priceError}</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-semibold tabular-nums" dir="ltr">
                        الإجمالي: {formatUsd(lineTotal)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
