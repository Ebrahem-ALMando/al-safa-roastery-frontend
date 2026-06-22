"use client"

import type { Item, ItemTableColumnId, ItemsListMeta, ItemsViewMode } from "@/features/items"
import { ItemsTable } from "./ItemsTable"
import { ItemsCards } from "./ItemsCards"

interface ItemsDataViewProps {
  viewMode: ItemsViewMode
  items: Item[]
  meta?: ItemsListMeta
  visibleColumns: ItemTableColumnId[]
  isLoading?: boolean
  isFilteredNoHits: boolean
  isTrueEmpty: boolean
  currentPage: number
  lastPage: number
  canPrev: boolean
  canNext: boolean
  onPageChange: (page: number) => void
  onAddItem: () => void
  onViewDetails: (item: Item) => void
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  onToggleActive: (item: Item) => void
}

export function ItemsDataView(props: ItemsDataViewProps) {
  if (props.viewMode === "cards") {
    return (
      <ItemsCards
        items={props.items}
        meta={props.meta}
        isLoading={props.isLoading}
        isFilteredNoHits={props.isFilteredNoHits}
        isTrueEmpty={props.isTrueEmpty}
        onAddItem={props.onAddItem}
        onViewDetails={props.onViewDetails}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        onToggleActive={props.onToggleActive}
        currentPage={props.currentPage}
        canPrev={props.canPrev}
        canNext={props.canNext}
        onPageChange={props.onPageChange}
      />
    )
  }

  return (
    <ItemsTable
      items={props.items}
      meta={props.meta}
      visibleColumns={props.visibleColumns}
      isLoading={props.isLoading}
      isFilteredNoHits={props.isFilteredNoHits}
      isTrueEmpty={props.isTrueEmpty}
      currentPage={props.currentPage}
      lastPage={props.lastPage}
      canPrev={props.canPrev}
      canNext={props.canNext}
      onPageChange={props.onPageChange}
      onAddItem={props.onAddItem}
      onViewDetails={props.onViewDetails}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onToggleActive={props.onToggleActive}
    />
  )
}
