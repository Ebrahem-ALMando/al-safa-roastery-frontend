import type {
  ProductPrice,
  ProductPricesFormValue,
  ProductPriceType,
  SaveProductPricesInput,
} from "../types/product.types";

export const PRODUCT_PRICE_TYPES: readonly ProductPriceType[] = [
  "retail",
  "wholesale",
  "car",
  "consumer",
];

export const PRODUCT_PRICE_TYPE_LABELS_AR: Record<ProductPriceType, string> = {
  retail: "سعر المفرق",
  wholesale: "سعر الجملة",
  car: "سعر السيارة",
  consumer: "سعر المستهلك",
};

export function emptyProductPricesForm(): ProductPricesFormValue {
  return {
    retail: { price: "", is_active: false, notes: "" },
    wholesale: { price: "", is_active: false, notes: "" },
    car: { price: "", is_active: false, notes: "" },
    consumer: { price: "", is_active: false, notes: "" },
  };
}

export function productPricesToForm(prices?: ProductPrice[] | null): ProductPricesFormValue {
  const form = emptyProductPricesForm();

  for (const price of prices ?? []) {
    if (!PRODUCT_PRICE_TYPES.includes(price.price_type)) continue;
    form[price.price_type] = {
      price: Number(price.price) === 0 ? "" : String(price.price),
      is_active: Boolean(price.is_active),
      notes: price.notes ?? "",
    };
  }

  return form;
}

export function productPricesToPayload(value: ProductPricesFormValue): SaveProductPricesInput {
  return {
    prices: PRODUCT_PRICE_TYPES.map((priceType) => ({
      price_type: priceType,
      price: value[priceType].price.trim() === "" ? 0 : Number(value[priceType].price),
      min_quantity: 0,
      is_active: value[priceType].is_active,
      notes: value[priceType].notes.trim() || null,
    })),
  };
}

export function validateProductPrices(
  value: ProductPricesFormValue,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  PRODUCT_PRICE_TYPES.forEach((priceType, index) => {
    const item = value[priceType];
    if (!item.is_active) return;

    if (item.price.trim() === "") {
      errors[`prices.${index}.price`] = ["السعر مطلوب عند تفعيل هذا السعر."];
      return;
    }

    const price = Number(item.price);
    if (!Number.isFinite(price)) {
      errors[`prices.${index}.price`] = ["يجب أن يكون السعر رقماً صحيحاً."];
    } else if (price <= 0) {
      errors[`prices.${index}.price`] = ["يجب أن يكون السعر أكبر من صفر."];
    }
  });

  return errors;
}

export function hasProductPriceChanges(value: ProductPricesFormValue): boolean {
  return PRODUCT_PRICE_TYPES.some((priceType) => {
    const item = value[priceType];
    return item.is_active || item.price.trim() !== "" || item.notes.trim() !== "";
  });
}

export function findActiveDisplayPrice(prices?: ProductPrice[] | null): ProductPrice | null {
  const active = (prices ?? []).filter((price) => price.is_active);
  for (const type of PRODUCT_PRICE_TYPES) {
    const match = active.find((price) => price.price_type === type);
    if (match) return match;
  }
  return null;
}

export function formatProductPriceSummary(product: {
  current_price: string | number | null;
  default_price: string | number | null;
  current_price_type: string | null;
}): string {
  const raw = product.current_price ?? product.default_price;
  if (raw === null || raw === undefined || raw === "") return "غير مسعّر";
  const amount = `$${Number(raw).toFixed(2)}`;
  const type = product.current_price_type as ProductPriceType | null;
  if (!type || type === "retail" || !PRODUCT_PRICE_TYPES.includes(type)) return amount;
  return `${amount} · ${PRODUCT_PRICE_TYPE_LABELS_AR[type]}`;
}
