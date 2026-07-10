export { useProductActions } from "./hooks/useProductActions";
export { useProductDetails } from "./hooks/useProductDetails";
export { useProducts } from "./hooks/useProducts";
export {
  useProductsPage,
  type ProductsActiveStatus,
  type ProductsPriceStatusFilter,
  type ProductsStockStatusFilter,
} from "./hooks/useProductsPage";
export { useProductSummary } from "./hooks/useProductSummary";

export type {
  CreateProductInput,
  Product,
  ProductLinkedItem,
  ProductPrice,
  ProductPriceStatus,
  ProductsListFilters,
  ProductsListMeta,
  ProductStockStatus,
  ProductSummaryFilters,
  ProductSummaryResponse,
  UpdateProductInput,
} from "./types/product.types";

export {
  DEFAULT_VISIBLE_PRODUCT_COLUMNS,
  getProductColumnLabel,
  insertProductColumnBeforeActions,
  normalizeProductVisibleColumns,
  PRODUCT_PRICE_STATUS_LABELS_AR,
  PRODUCT_STOCK_STATUS_LABELS_AR,
  PRODUCT_TABLE_COLUMNS,
  PRODUCTS_PERIOD_DROPDOWN_PRESETS,
  PRODUCTS_PERIOD_LABELS_AR,
  PRODUCTS_TABLE_COLUMNS_STORAGE_KEY,
  type ProductsCustomPeriod,
  type ProductsPeriodPreset,
  type ProductsViewMode,
  type ProductTableColumnId,
} from "./lib/products.constants";

export {
  defaultCustomPeriod,
  formatArDateTime,
  formatProductPrice,
  formatQuantityKg,
  getProductPriceStatusLabel,
  getProductStockBadgeClass,
  getProductStockStatus,
  getProductStockStatusLabel,
  linkedItemCode,
  linkedItemName,
  productDisplayName,
  productInitials,
  readStoredProductsPeriod,
  resolveProductsPeriodRange,
} from "./lib/products.helpers";

export { PRODUCT_MESSAGES } from "./lib/products.messages";
