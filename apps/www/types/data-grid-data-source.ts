import type { ColumnFiltersState, PaginationState, RowPinningState, SortingState } from "@tanstack/react-table"

export interface DataGridQuery {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
}

export interface DataGridPage<TData> {
  rows: TData[]
  total: number
}

export interface DataGridColumnPreference {
  columnId: string
  orderRank: number
  pinPosition: "left" | "right" | null
}

export interface DataGridRowMove {
  rowId: string
  previousRowId: string | null
  nextRowId: string | null
}

export interface DataGridFeatureDataSource<TData extends { id: string }> {
  mode: "client" | "server"
  getRows: (query: DataGridQuery) => Promise<DataGridPage<TData>>
  getRowPinning: () => Promise<RowPinningState>
  getColumnState: () => Promise<DataGridColumnPreference[]>
  updateRow: (rowId: string, nextRow: TData) => Promise<void>
  reorderRows: (move: DataGridRowMove) => Promise<void>
  saveRowPinning: (state: RowPinningState) => Promise<void>
  saveColumnState: (state: readonly DataGridColumnPreference[]) => Promise<void>
}
