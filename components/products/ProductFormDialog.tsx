"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/components/ui/custom-toast-with-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateProductInput,
  ProductPricesFormValue,
  SaveProductPricesInput,
  Product,
  UpdateProductInput,
} from "@/features/products";
import {
  emptyProductPricesForm,
  hasProductPriceChanges,
  productPricesToForm,
  productPricesToPayload,
  validateProductPrices,
} from "@/features/products";
import { ApiRequestError } from "@/lib/api";
import { motion } from "framer-motion";
import { Check, CircleDollarSign, Loader2, Package, Pencil, X } from "lucide-react";
import * as React from "react";
import {
  ProductLinkedItemSelector,
  type ProductLinkedItemPreview,
} from "./ProductLinkedItemSelector";
import { ProductPricesManager } from "./prices/ProductPricesManager";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function mapSubmitError(error: unknown): string | null {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) return null;
    if (error.status === 422) return "البيانات غير صحيحة";
    if (error.status === 403) return "الحساب غير مفعل";
    if (error.status >= 500) return "حدث خطأ في النظام";
    if (error.status === 0) return "تحقق من الاتصال";
  }
  return "تحقق من الاتصال";
}

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product?: Product | null;
  onCreate?: (payload: CreateProductInput) => Promise<unknown>;
  onUpdate?: (id: number, payload: UpdateProductInput) => Promise<unknown>;
  onSavePrices?: (id: number, payload: SaveProductPricesInput) => Promise<unknown>;
  onSaved?: () => void;
};

type ProductFormState = {
  name: string;
  readyItemId: number | null;
  readyItemPreview: ProductLinkedItemPreview | null;
  deductionWeightKg: string;
  isActive: boolean;
  notes: string;
};

function emptyForm(): ProductFormState {
  return {
    name: "",
    readyItemId: null,
    readyItemPreview: null,
    deductionWeightKg: "",
    isActive: true,
    notes: "",
  };
}

function toForm(product: Product): ProductFormState {
  return {
    name: product.name ?? "",
    readyItemId: product.ready_item_id ?? product.linked_item_id ?? null,
    readyItemPreview:
      product.linked_item || product.ready_item
        ? {
            id:
              product.linked_item?.id ??
              product.ready_item?.id ??
              product.ready_item_id ??
              0,
            name: product.linked_item?.name ?? product.ready_item?.name ?? "",
            code: product.linked_item?.code ?? product.ready_item?.code ?? null,
            itemType: (product.linked_item?.item_type ??
              product.ready_item?.item_type ??
              "ready") as "raw" | "ready",
            currentQuantityKg:
              product.linked_item?.current_quantity_kg ??
              product.ready_item?.current_quantity_kg ??
              null,
            averageCost:
              product.linked_item?.average_cost ??
              product.ready_item?.average_cost ??
              null,
          }
        : null,
    deductionWeightKg:
      product.deduction_weight_kg == null
        ? ""
        : String(product.deduction_weight_kg),
    isActive: product.is_active,
    notes: product.notes ?? "",
  };
}

function toCreatePayload(form: ProductFormState): CreateProductInput {
  return {
    name: form.name.trim(),
    ready_item_id: form.readyItemId ?? 0,
    sale_type: "piece",
    deduction_weight_kg:
      form.deductionWeightKg.trim() === "" ? 0 : Number(form.deductionWeightKg),
    is_active: form.isActive,
    notes: form.notes.trim() || null,
  };
}

function toUpdatePayload(form: ProductFormState): UpdateProductInput {
  const payload: UpdateProductInput = {
    name: form.name.trim(),
    ready_item_id: form.readyItemId ?? 0,
    sale_type: "piece",
    deduction_weight_kg:
      form.deductionWeightKg.trim() === "" ? 0 : Number(form.deductionWeightKg),
    is_active: form.isActive,
    notes: form.notes.trim() || null,
  };
  return payload;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  product,
  onCreate,
  onUpdate,
  onSavePrices,
  onSaved,
}: ProductFormDialogProps) {
  const [form, setForm] = React.useState<ProductFormState>(() =>
    mode === "edit" && product ? toForm(product) : emptyForm()
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [priceForm, setPriceForm] = React.useState<ProductPricesFormValue>(() =>
    mode === "edit" && product ? productPricesToForm(product.prices) : emptyProductPricesForm()
  );
  const [priceSection, setPriceSection] = React.useState("");
  const [priceDirty, setPriceDirty] = React.useState(false);
  const [priceErrors, setPriceErrors] = React.useState<Record<string, string[]>>({});

  const formResetKey = React.useMemo(
    () => `${mode}-${product?.id ?? "new"}-${open ? "open" : "closed"}`,
    [mode, product?.id, open],
  );

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setForm(emptyForm());
      setFieldErrors({});
      setSelectorOpen(false);
      setPriceForm(emptyProductPricesForm());
      setPriceSection("");
      setPriceDirty(false);
      setPriceErrors({});
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const name = form.name.trim();
    if (!name) {
      toast.error("اسم المنتج مطلوب");
      return;
    }

    if (!form.readyItemId) {
      toast.error("اختر صنفاً مرتبطاً");
      return;
    }

    const deduction = Number(form.deductionWeightKg);
    if (!Number.isFinite(deduction) || deduction <= 0) {
      toast.error("كمية الخصم يجب أن تكون أكبر من صفر");
      return;
    }

    const shouldSavePrices = priceDirty && hasProductPriceChanges(priceForm);
    if (shouldSavePrices) {
      const validationErrors = validateProductPrices(priceForm);
      if (Object.keys(validationErrors).length > 0) {
        setPriceErrors(validationErrors);
        setPriceSection("prices");
        return;
      }
    }

    setSubmitting(true);
    setFieldErrors({});
    setPriceErrors({});
    try {
      let savedProduct: Product | null = null;
      if (mode === "create" && onCreate) {
        savedProduct = (await onCreate(toCreatePayload(form))) as Product;
      } else if (mode === "edit" && product && onUpdate) {
        savedProduct = (await onUpdate(product.id, toUpdatePayload(form))) as Product;
      }

      const savedProductId = savedProduct?.id ?? product?.id;
      if (shouldSavePrices && savedProductId && onSavePrices) {
        try {
          await onSavePrices(savedProductId, productPricesToPayload(priceForm));
        } catch {
          toast.warning(
            mode === "create"
              ? "تم إنشاء المنتج، لكن تعذر حفظ الأسعار. يمكنك تعديل الأسعار من إجراء إدارة الأسعار."
              : "تم تحديث المنتج، لكن تعذر حفظ الأسعار. يمكنك إعادة المحاولة من إجراء إدارة الأسعار.",
          );
          onSaved?.();
          handleOpenChange(false);
          return;
        }
      }
      onSaved?.();
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof ApiRequestError && err.errors) {
        setFieldErrors(err.errors);
      }
      const message = mapSubmitError(err);
      if (message) {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isCreate = mode === "create";
  const HeaderIcon = isCreate ? Package : Pencil;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        lang="ar"
        showCloseButton={false}
        className="flex max-h-[min(92vh,760px)] flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl sm:min-h-[min(56vh,520px)] sm:max-w-[720px]"
      >
        <form
          key={formResetKey}
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="relative z-10 shrink-0 border-b border-border/50 bg-gradient-to-b from-background via-background to-background/95 px-6 pb-4 pt-6 backdrop-blur-sm">
            <DialogHeader className="space-y-2 text-right sm:text-right">
              <div className="flex items-start gap-3">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
                  aria-hidden
                >
                  <HeaderIcon className="size-5" />
                </motion.span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <DialogTitle className="text-lg font-bold leading-snug tracking-tight">
                    {isCreate ? "إضافة منتج جديد" : "تعديل بيانات المنتج"}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                      {isCreate ? (
                        <>
                          <p>
                            املأ الحقول التالية بعناية لإنشاء منتج جديد. يولّد
                            النظام{" "}
                            <span className="font-medium text-foreground/90">
                              كود المنتج تلقائياً
                            </span>{" "}
                            بعد الحفظ.
                          </p>
                          <p>
                            <span className="text-destructive">*</span> يشير إلى
                            حقل مطلوب.
                          </p>
                        </>
                      ) : product ? (
                        <>
                          <p>
                            <span className="font-medium text-foreground/90">
                              {product.name}
                            </span>
                          </p>
                          <p>عدّل بيانات المنتج ثم احفظ التغييرات.</p>
                        </>
                      ) : (
                        <p>عدّل بيانات المنتج ثم احفظ التغييرات.</p>
                      )}
                    </div>
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="إغلاق"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
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
              <motion.fieldset
                variants={fadeUp}
                className="min-w-0 space-y-0 rounded-2xl border border-border/50 bg-card/60 p-4"
              >
                <legend className="px-2 text-sm font-semibold text-foreground">
                  معلومات المنتج
                </legend>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="product-name"
                      className="text-[13px] text-foreground/80"
                    >
                      اسم المنتج <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="مثال: ذرة حلوة 250 غ"
                      className="h-11 rounded-xl border-border/60"
                      autoFocus={isCreate}
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name ? (
                      <p className="text-sm text-destructive">
                        {fieldErrors.name[0]}
                      </p>
                    ) : null}
                  </div>

                  <ProductLinkedItemSelector
                    open={selectorOpen}
                    onOpenChange={setSelectorOpen}
                    value={form.readyItemId}
                    preview={form.readyItemPreview}
                    onSelect={(item) =>
                      setForm((prev) => ({
                        ...prev,
                        readyItemId: item?.id ?? null,
                        readyItemPreview: item,
                      }))
                    }
                    error={fieldErrors.ready_item_id?.[0]}
                  />

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="product-deduction"
                      className="text-[13px] text-foreground/80"
                    >
                      كمية الخصم من المخزون لكل وحدة مباعة (كغ){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-deduction"
                      type="number"
                      inputMode="decimal"
                      step="0.001"
                      min="0.001"
                      value={form.deductionWeightKg}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          deductionWeightKg: e.target.value,
                        }))
                      }
                      placeholder="مثال: 0.250"
                      className="h-11 rounded-xl border-border/60"
                    />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      عند بيع وحدة واحدة من هذا المنتج، سيتم خصم هذه الكمية من
                      الصنف المرتبط.
                    </p>
                    {fieldErrors.deduction_weight_kg ? (
                      <p className="text-sm text-destructive">
                        {fieldErrors.deduction_weight_kg[0]}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3 py-3">
                    <div>
                      <Label
                        htmlFor="product-active"
                        className="text-[13px] text-foreground/80"
                      >
                        الحالة
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        فعال / موقوف
                      </p>
                    </div>
                    <Switch
                      id="product-active"
                      checked={form.isActive}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          isActive: Boolean(checked),
                        }))
                      }
                    />
                  </div>
                </div>
              </motion.fieldset>

              <motion.div variants={fadeUp}>
                <Accordion
                  type="single"
                  collapsible
                  value={priceSection}
                  onValueChange={setPriceSection}
                  dir="rtl"
                >
                  <AccordionItem
                    value="prices"
                    className="overflow-hidden rounded-2xl border border-b-0 border-primary/20 bg-primary/[0.025] shadow-sm"
                  >
                    <AccordionTrigger className="gap-3 rounded-xl bg-primary/[0.035] px-4 py-3.5 text-start! hover:bg-primary/[0.06] hover:no-underline data-[state=open]:bg-primary/[0.06]">
                      <span className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-1.5 text-start">
                        <span className="inline-flex flex-row-reverse items-center gap-2 text-start text-base font-semibold tracking-tight text-foreground">
                          <span className="min-w-0 text-pretty">إدارة الأسعار</span>
                          <CircleDollarSign className="size-4 shrink-0 text-primary" aria-hidden />
                        </span>
                        <span className="text-pretty text-start text-[13px] font-normal leading-snug text-muted-foreground">
                          يمكنك إضافة أسعار السيارة والجملة والمفرق أثناء إنشاء المنتج أو تعديلها لاحقاً.
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0 sm:px-5">
                      <ProductPricesManager
                        value={priceForm}
                        onChange={(next) => {
                          setPriceForm(next);
                          setPriceDirty(true);
                        }}
                        defaultExpanded={false}
                        errors={priceErrors}
                        disabled={submitting}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>

              <motion.fieldset
                variants={fadeUp}
                className="min-w-0 space-y-0 rounded-2xl border border-border/50 bg-card/60 p-4"
              >
                <legend className="px-2 text-sm font-semibold text-foreground">
                  الملاحظات
                </legend>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="product-notes"
                    className="text-[13px] text-foreground/80"
                  >
                    ملاحظات
                  </Label>
                  <Textarea
                    id="product-notes"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="أدخل أي ملاحظات إضافية عن المنتج (اختياري)"
                    className="min-h-24 rounded-xl border-border/60"
                  />
                  {fieldErrors.notes ? (
                    <p className="text-sm text-destructive">
                      {fieldErrors.notes[0]}
                    </p>
                  ) : null}
                </div>
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
                    <Loader2 className="size-4 shrink-0 animate-spin" />{" "}
                    <span>جارٍ الحفظ</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    {isCreate ? "حفظ المنتج" : "حفظ التغييرات"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl gap-2"
              >
                <X className="size-4" />
                إلغاء
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
