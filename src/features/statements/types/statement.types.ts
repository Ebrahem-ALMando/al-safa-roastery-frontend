export type StatementEntityType = "customer" | "supplier"

export type StatementUserRef = {
  id: number
  name: string
}

export type StatementParty = {
  id: number
  type: StatementEntityType
  code: string | null
  name: string
  phone: string | null
  current_balance: string | number
}

export type StatementPeriod = {
  date_from: string | null
  date_to: string | null
  include_opening_balance: boolean
  include_cancelled: boolean
}

export type StatementSummary = {
  opening_balance: string | number
  total_increase: string | number
  total_decrease: string | number
  net_change: string | number
  closing_balance: string | number
  current_stored_balance: string | number
  difference: string | number
}

export type StatementEntry = {
  entry_type: string
  entry_label: string
  reference_type: string | null
  reference_id: number | null
  reference_number: string | null
  entry_date: string
  status: string
  total: string | number
  paid_or_received_amount: string | number
  remaining_or_balance_impact: string | number
  increase: string | number
  decrease: string | number
  balance_after: string | number
  allocated_amount: string | number | null
  unallocated_amount: string | number | null
  notes: string | null
  created_by: StatementUserRef | null
}

export type StatementResponse = {
  party: StatementParty
  period: StatementPeriod
  summary: StatementSummary
  entries: StatementEntry[]
}

export type StatementEntityOption = {
  id: number
  name: string
  code: string | null
  phone: string | null
}

export type StatementQuery = {
  date_from?: string
  date_to?: string
}
