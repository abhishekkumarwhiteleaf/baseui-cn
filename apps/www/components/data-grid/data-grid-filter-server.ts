import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table"

export interface DataGridQuery {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
}
