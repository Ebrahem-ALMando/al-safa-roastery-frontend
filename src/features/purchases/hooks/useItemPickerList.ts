"use client";

import type { Item, ItemsListMeta } from "@/features/items/types/item.types";
import type { QueryParams } from "@/lib/api";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useMemo } from "react";

const ENDPOINT = "items";
const PICKER_ENDPOINT = "items/picker";
const PICKER_PER_PAGE = 100;
const CLIENT_SEARCH_LIMIT = 1000;

export type ItemPickerRow = {
  id: string;
  name: string;
  code: string;
  itemType: Item["item_type"];
  currentQuantityKg: string | number | null;
  averageCost: string | number | null;
  lastPurchasePrice: string | number | null;
};

type ItemPickerApiRow = Pick<
  Item,
  | "id"
  | "name"
  | "code"
  | "item_type"
  | "current_quantity_kg"
  | "average_cost"
  | "last_purchase_price"
>;

function mapItem(item: ItemPickerApiRow): ItemPickerRow {
  return {
    id: String(item.id),
    name: item.name,
    code: item.code?.trim() ? item.code : "—",
    itemType: item.item_type,
    currentQuantityKg: item.current_quantity_kg,
    averageCost: item.average_cost,
    lastPurchasePrice: item.last_purchase_price,
  };
}

type UseItemPickerListArgs = {
  open: boolean;
  search: string;
  debounceMs?: number;
  itemType?: "raw" | "ready";
  activeOnly?: boolean;
  clientSearch?: boolean;
};

export function useItemPickerList({
  open,
  search,
  debounceMs = 350,
  itemType,
  activeOnly = false,
  clientSearch = false,
}: UseItemPickerListArgs) {
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const queryParams = useMemo((): QueryParams => {
    const q: QueryParams = clientSearch
      ? { limit: CLIENT_SEARCH_LIMIT }
      : {
          page: 1,
          per_page: PICKER_PER_PAGE,
        };
    if (activeOnly) {
      q.is_active = 1;
    }
    if (itemType) {
      q.item_type = itemType;
    }
    const s = debouncedSearch.trim();
    if (!clientSearch && s !== "") {
      q.search = s;
    }
    return q;
  }, [debouncedSearch, activeOnly, itemType, clientSearch]);

  const endpoint = clientSearch ? PICKER_ENDPOINT : ENDPOINT;

  const swrKey = useMemo(
    () => (open ? `item-picker:${JSON.stringify(queryParams)}` : null),
    [open, queryParams],
  );

  const { data, meta, isLoading, error, mutate } = useApiQuery<ItemPickerApiRow[]>(
    swrKey,
    endpoint,
    {
      queryParams,
    },
  );

  const rows = useMemo(() => {
    const mapped = (data ?? []).map(mapItem);
    const s = clientSearch ? search.trim().toLowerCase() : "";
    if (s === "") return mapped;

    return mapped.filter((item) => {
      const name = item.name.toLowerCase();
      const code = item.code.toLowerCase();
      return name.includes(s) || code.includes(s);
    });
  }, [data, search, clientSearch]);
  const listMeta = meta as ItemsListMeta | undefined;

  return {
    rows,
    meta: listMeta,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
    isSearchPending: !clientSearch && open && debouncedSearch !== search,
  };
}
