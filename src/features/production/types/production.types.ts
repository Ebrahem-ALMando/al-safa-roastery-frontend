export type ProductionStatus = "draft" | "completed" | "cancelled"

export type ProductionUserRef = { id: number; name: string }

export type ProductionItemRef = {
  id: number
  code: string | null
  name: string
  item_type: "raw" | "ready"
  current_quantity_kg: string | number | null
  average_cost: string | number | null
}

export type ProductionMovement = {
  id: number
  item_id?: number
  movement_date: string | null
  movement_type: string
  movement_label_ar?: string
  direction: "in" | "out"
  quantity_kg: string | number
  unit_cost: string | number | null
  total_cost: string | number | null
  quantity_before: string | number
  quantity_after: string | number
  reference_type: string | null
  reference_id: number | null
  source_number?: string | null
  notes?: string | null
  created_by?: ProductionUserRef | null
}

export type ProductionInputLine = {
  id: number
  production_batch_id: number
  raw_item_id: number
  quantity_kg: string | number
  unit_cost: string | number
  total_cost: string | number
  notes: string | null
  raw_item?: ProductionItemRef | null
  inventory_movement?: ProductionMovement | null
  cancellation_inventory_movement?: ProductionMovement | null
}

export type ProductionOutputLine = {
  id: number
  production_batch_id: number
  ready_item_id: number
  quantity_kg: string | number
  allocated_cost: string | number
  unit_cost: string | number
  previous_average_cost: string | number | null
  new_average_cost: string | number | null
  notes: string | null
  ready_item?: ProductionItemRef | null
  inventory_movement?: ProductionMovement | null
  cancellation_inventory_movement?: ProductionMovement | null
}

export type ProductionBatch = {
  id: number
  batch_number: string | null
  production_date: string
  status: ProductionStatus
  total_input_weight_kg: string | number
  total_output_weight_kg: string | number
  waste_weight_kg: string | number
  total_input_cost: string | number
  additional_cost: string | number
  total_production_cost: string | number
  cost_per_output_kg: string | number
  yield_percentage: string | number
  notes: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string | null
  updated_at: string | null
  inputs_count: number | null
  output?: ProductionOutputLine | null
  inputs?: ProductionInputLine[]
  outputs?: ProductionOutputLine[]
  created_by?: ProductionUserRef | null
  updated_by?: ProductionUserRef | null
  completed_by?: ProductionUserRef | null
  cancelled_by?: ProductionUserRef | null
}

export type ProductionListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export type ProductionFilterItem = { id: number; label: string }

export type ProductionListFilters = {
  search?: string
  status?: ProductionStatus
  output_item_id?: number
  input_item_ids?: number[]
  output_quantity_min?: number
  output_quantity_max?: number
  date_from?: string
  date_to?: string
  sort_by?: string
  sort_direction?: "asc" | "desc"
  per_page?: number
}

export type ProductionSummaryResponse = {
  production_batches_count: number
  completed_batches_count: number
  cancelled_batches_count: number
  total_output_quantity_kg: string | number
  total_input_cost: string | number
  average_yield_percentage: string | number
}

export type SaveProductionInput = {
  batch_number?: string | null
  production_date: string
  additional_cost?: number
  notes?: string | null
  inputs: Array<{ raw_item_id: number; quantity_kg: number; notes?: string | null }>
  outputs: [{ ready_item_id: number; quantity_kg: number; notes?: string | null }]
}

export type CancelProductionInput = { cancel_reason: string }
