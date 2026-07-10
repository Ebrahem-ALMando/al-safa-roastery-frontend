export type ProductUserRef = {
  id: number;
  name: string;
};

export type ProductLinkedItem = {
  id: number;
  code: string | null;
  name: string;
  item_type: "raw" | "ready";
  current_quantity_kg: string | number | null;
  minimum_quantity_kg: string | number | null;
  average_cost: string | number | null;
  stock_status?: ProductStockStatus | null;
};

export type ProductPrice = {
  id: number;
  product_id: number;
  price_type: "retail" | "wholesale" | "car" | "consumer" | string;
  price: string | number;
  min_quantity: string | number | null;
  is_active: boolean;
  notes: string | null;
};

export type ProductPriceStatus = "priced" | "unpriced";

export type ProductStockStatus =
  | "available"
  | "reorder_required"
  | "low"
  | "out_of_stock"
  | "unlinked";

export type Product = {
  id: number;
  code: string | null;
  barcode: string | null;
  sku: string | null;
  name: string;
  item_id: number | null;
  linked_item_id: number | null;
  ready_item_id: number | null;
  sale_type: string;
  deduction_weight_kg: string | number | null;
  package_label: string | null;
  is_default_for_item: boolean;
  is_active: boolean;
  notes: string | null;
  price_status: ProductPriceStatus;
  current_price: string | number | null;
  current_price_type: string | null;
  default_price: string | number | null;
  prices_summary?: {
    active_prices_count: number;
    current_price: string | number | null;
    current_price_type: string | null;
  };
  stock_status: ProductStockStatus | null;
  current_quantity_kg: string | number | null;
  minimum_quantity_kg: string | number | null;
  average_cost: string | number | null;
  ready_item?: ProductLinkedItem | null;
  linked_item?: ProductLinkedItem | null;
  prices?: ProductPrice[];
  last_activity: null;
  created_at: string | null;
  updated_at: string | null;
  created_by?: ProductUserRef;
  updated_by?: ProductUserRef;
};

export type ProductsListMeta = {
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
};

export type ProductsListFilters = {
  search?: string;
  is_active?: boolean;
  linked_item_id?: number;
  price_status?: ProductPriceStatus;
  stock_status?: ProductStockStatus;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

export type ProductSummaryFilters = Omit<
  ProductsListFilters,
  "page" | "per_page" | "sort_by" | "sort_direction"
>;

export type ProductSummaryResponse = {
  active_products_count: number;
  priced_products_count: number;
  unpriced_products_count: number;
  reorder_required_products_count: number;
};

export type CreateProductInput = {
  name: string;
  ready_item_id: number;
  sale_type: string;
  deduction_weight_kg: number | string;
  is_active?: boolean;
  notes?: string | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type UpdateProductStatusInput = {
  is_active: boolean;
};
