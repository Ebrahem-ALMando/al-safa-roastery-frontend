"use client";

import type { Item, ItemsListMeta } from "@/features/items/types/item.types";
import type { QueryParams } from "@/lib/api";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useMemo } from "react";

const ENDPOINT = "items";
const PICKER_PER_PAGE = 100;

export type ItemPickerRow = {
  id: string;
  name: string;
  code: string;
  itemType: Item["item_type"];
  currentQuantityKg: string | number | null;
  averageCost: string | number | null;
};

function mapItem(item: Item): ItemPickerRow {
  return {
    id: String(item.id),
    name: item.name,
    code: item.code?.trim() ? item.code : "—",
    itemType: item.item_type,
    currentQuantityKg: item.current_quantity_kg,
    averageCost: item.average_cost,
  };
}

type UseItemPickerListArgs = {
  open: boolean;
  search: string;
  debounceMs?: number;
  itemType?: "raw" | "ready";
  activeOnly?: boolean;
};

export function useItemPickerList({
  open,
  search,
  debounceMs = 350,
  itemType,
  activeOnly = false,
}: UseItemPickerListArgs) {
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const queryParams = useMemo((): QueryParams => {
    const q: QueryParams = {
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
    if (s !== "") {
      q.search = s;
    }
    return q;
  }, [debouncedSearch, activeOnly, itemType]);

  const swrKey = useMemo(
    () => (open ? `item-picker:${JSON.stringify(queryParams)}` : null),
    [open, queryParams],
  );

  const { data, meta, isLoading, error, mutate } = useApiQuery<Item[]>(
    swrKey,
    ENDPOINT,
    {
      queryParams,
    },
  );

  const rows = useMemo(() => (data ?? []).map(mapItem), [data]);
  const listMeta = meta as ItemsListMeta | undefined;

  return {
    rows,
    meta: listMeta,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
    isSearchPending: open && debouncedSearch !== search,
  };
}
