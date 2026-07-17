import {
  Boxes,
  CarFront,
  ShoppingBag,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  PRODUCT_PRICE_TYPE_LABELS_AR,
  type ProductPriceType,
} from "@/features/products";

export type ProductPriceAccent = "sky" | "amber" | "emerald" | "violet";

export const PRODUCT_PRICE_DISPLAY_ORDER: ProductPriceType[] = [
  "consumer",
  "retail",
  "wholesale",
  "car",
];

export const PRODUCT_PRICE_ACCENT_STYLES = {
  sky: {
    card: "border-sky-200/80 bg-sky-50/35 dark:border-sky-900 dark:bg-sky-950/25",
    header: "bg-sky-50/70 dark:bg-sky-950/60",
    iconBox:
      "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
  },
  amber: {
    card: "border-amber-200/80 bg-amber-50/35 dark:border-amber-900 dark:bg-amber-950/25",
    header: "bg-amber-50/70 dark:bg-amber-950/60",
    iconBox:
      "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  },
  emerald: {
    card: "border-emerald-200/80 bg-emerald-50/35 dark:border-emerald-900 dark:bg-emerald-950/25",
    header: "bg-emerald-50/70 dark:bg-emerald-950/60",
    iconBox:
      "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  },
  violet: {
    card: "border-violet-200/80 bg-violet-50/35 dark:border-violet-900 dark:bg-violet-950/25",
    header: "bg-violet-50/70 dark:bg-violet-950/60",
    iconBox:
      "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800",
  },
} as const;

export const PRODUCT_PRICE_UI_CONFIG: Record<
  ProductPriceType,
  {
    title: string;
    helper: string;
    icon: LucideIcon;
    accent: ProductPriceAccent;
  }
> = {
  consumer: {
    title: PRODUCT_PRICE_TYPE_LABELS_AR.consumer,
    helper: "سعر الزبون العادي الذي يشتري لنفسه.",
    icon: UserRound,
    accent: "violet",
  },
  retail: {
    title: PRODUCT_PRICE_TYPE_LABELS_AR.retail,
    helper: "سعر البيع المفرق حسب سياسة المحمصة.",
    icon: ShoppingBag,
    accent: "emerald",
  },
  wholesale: {
    title: PRODUCT_PRICE_TYPE_LABELS_AR.wholesale,
    helper: "سعر البيع المخصص لزبائن الجملة.",
    icon: Boxes,
    accent: "amber",
  },
  car: {
    title: PRODUCT_PRICE_TYPE_LABELS_AR.car,
    helper: "سعر البيع المخصص لزبائن السيارات.",
    icon: CarFront,
    accent: "sky",
  },
};

export function getProductPriceTheme(type: ProductPriceType) {
  const config = PRODUCT_PRICE_UI_CONFIG[type];

  return {
    ...config,
    styles: PRODUCT_PRICE_ACCENT_STYLES[config.accent],
  };
}
