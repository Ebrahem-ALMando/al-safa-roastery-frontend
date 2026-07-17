"use client";

import type { ProductPricesFormValue, ProductPriceType } from "@/features/products";
import { PRODUCT_PRICE_TYPES } from "@/features/products";
import { ProductPriceFieldset } from "./ProductPriceFieldset";
import {
  PRODUCT_PRICE_DISPLAY_ORDER,
  PRODUCT_PRICE_UI_CONFIG,
} from "./product-price-theme";

type ProductPricesManagerProps = {
  value: ProductPricesFormValue;
  onChange: (value: ProductPricesFormValue) => void;
  defaultExpanded?: boolean;
  errors?: Record<string, string[]>;
  disabled?: boolean;
};

export function ProductPricesManager({
  value,
  onChange,
  defaultExpanded = true,
  errors = {},
  disabled = false,
}: ProductPricesManagerProps) {
  return (
    <div className="space-y-3">
      {PRODUCT_PRICE_DISPLAY_ORDER.map((priceType) => {
        const config = PRODUCT_PRICE_UI_CONFIG[priceType];
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
