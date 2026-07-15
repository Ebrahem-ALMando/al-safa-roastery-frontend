"use client";

import type { ProductPricesFormValue, ProductPriceType } from "@/features/products";
import { PRODUCT_PRICE_TYPES } from "@/features/products";
import { Boxes, CarFront, ShoppingBag, UserRound } from "lucide-react";
import { ProductPriceFieldset } from "./ProductPriceFieldset";

type ProductPricesManagerProps = {
  value: ProductPricesFormValue;
  onChange: (value: ProductPricesFormValue) => void;
  defaultExpanded?: boolean;
  errors?: Record<string, string[]>;
  disabled?: boolean;
};

const configs = {
  car: { title: "سعر السيارة", helper: "سعر البيع المخصص لزبائن السيارات.", icon: CarFront, accent: "sky" },
  wholesale: { title: "سعر الجملة", helper: "سعر البيع المخصص لزبائن الجملة.", icon: Boxes, accent: "amber" },
  retail: { title: "سعر المفرق", helper: "سعر البيع الأساسي لزبائن المفرق.", icon: ShoppingBag, accent: "emerald" },
  consumer: { title: "سعر المستهلك", helper: "السعر المرجعي المستقل المطلوب لاحتساب المبيعات والخصومات.", icon: UserRound, accent: "violet" },
} as const;

const displayOrder: ProductPriceType[] = ["car", "wholesale", "retail", "consumer"];

export function ProductPricesManager({
  value,
  onChange,
  defaultExpanded = true,
  errors = {},
  disabled = false,
}: ProductPricesManagerProps) {
  return (
    <div className="space-y-3">
      {displayOrder.map((priceType) => {
        const config = configs[priceType];
        const payloadIndex = PRODUCT_PRICE_TYPES.indexOf(priceType);
        return (
          <ProductPriceFieldset
            key={priceType}
            priceType={priceType}
            title={config.title}
            helper={config.helper}
            icon={config.icon}
            accent={config.accent}
            value={value[priceType]}
            onChange={(next) => onChange({ ...value, [priceType]: next })}
            defaultExpanded={defaultExpanded}
            error={errors[`prices.${payloadIndex}.price`]?.[0]}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
