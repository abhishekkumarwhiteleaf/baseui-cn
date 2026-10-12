import type { FilterFn, RowData } from "@tanstack/react-table"
import type { ColumnFilterState } from "@/types/data-grid-filter"
import { matchesDateFilter } from "./matching/date-matching"
import { matchesNumberFilter } from "./matching/number-matching"
import { matchesTextFilter } from "./matching/text-matching"

function isColumnFilterState(value: unknown): value is ColumnFilterState {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false
  }

  const filter = value as Partial<ColumnFilterState>
  return (
    (filter.type === "text" || filter.type === "number" || filter.type === "date") &&
    typeof filter.operator === "string" &&
    typeof filter.value === "string"
  )
}

export function createExcelFilterFn<TData extends RowData>(): FilterFn<TData> {
  return (row, columnId, value) => {
    if (!isColumnFilterState(value)) return true

    if (value.type === "text") {
      return matchesTextFilter(row.getValue(columnId), value.operator, value.value)
    }
    if (value.type === "number") {
      return matchesNumberFilter(row.getValue(columnId), value.operator, value.value)
    }
    return matchesDateFilter(row.getValue(columnId), value.operator, value.value, value.secondValue)
  }
}
