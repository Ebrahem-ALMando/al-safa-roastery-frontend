export { useProducts } from "./hooks/useProducts"
export { useProductSummary } from "./hooks/useProductSummary"
export { useProductDetails } from "./hooks/useProductDetails"
export { useProductActions } from "./hooks/useProductActions"
export {
  useProductsPage,
  type ProductsActiveStatus,
  type ProductsPriceStatusFilter,
  type ProductsStockStatusFilter,
} from "./hooks/useProductsPage"

export type {
  Product,
  ProductLinkedItem,
  ProductPrice,
  ProductPriceStatus,
  ProductStockStatus,
  ProductsListFilters,
  ProductsListMeta,
  ProductSummaryFilters,
  ProductSummaryResponse,
} from "./types/product.types"

export {
  PRODUCT_TABLE_COLUMNS,
  DEFAULT_VISIBLE_PRODUCT_COLUMNS,
  PRODUCT_PRICE_STATUS_LABELS_AR,
  PRODUCT_STOCK_STATUS_LABELS_AR,
  PRODUCTS_PERIOD_LABELS_AR,
  PRODUCTS_PERIOD_DROPDOWN_PRESETS,
  PRODUCTS_TABLE_COLUMNS_STORAGE_KEY,
  getProductColumnLabel,
  insertProductColumnBeforeActions,
  normalizeProductVisibleColumns,
  type ProductTableColumnId,
  type ProductsCustomPeriod,
  type ProductsPeriodPreset,
  type ProductsViewMode,
} from "./lib/products.constants"

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
} from "./lib/products.helpers"

export { PRODUCT_MESSAGES } from "./lib/products.messages"
