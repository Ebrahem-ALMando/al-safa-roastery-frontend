"use client";

import type {
  Product,
  ProductTableColumnId,
  ProductsListMeta,
  ProductsViewMode,
} from "@/features/products";
import { ProductsCards } from "./ProductsCards";
import { ProductsTable } from "./ProductsTable";

type ProductsDataViewProps = {
  viewMode: ProductsViewMode;
  products: Product[];
  meta?: ProductsListMeta;
  visibleColumns: ProductTableColumnId[];
  isLoading?: boolean;
  isFilteredNoHits: boolean;
  isTrueEmpty: boolean;
  currentPage: number;
  lastPage: number;
  canPrev: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
};

export function ProductsDataView(props: ProductsDataViewProps) {
  if (props.viewMode === "cards") {
    return <ProductsCards {...props} />;
  }

  return <ProductsTable {...props} />;
}
