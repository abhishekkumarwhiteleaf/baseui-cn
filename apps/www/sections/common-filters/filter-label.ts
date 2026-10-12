import type { ColumnFilterState } from "@/types/data-grid-filter"
import { DATE_OPERATOR_LABELS } from "./date"
import { TEXT_OPERATOR_LABELS } from "./text"

export function formatFilterLabel(columnLabel: string, filter: ColumnFilterState): string {
  if (filter.type === "text") {
    const operator = TEXT_OPERATOR_LABELS[filter.operator]
    return filter.operator === "blank" || filter.operator === "notBlank"
      ? `${columnLabel} ${operator.toLowerCase()}`
      : `${columnLabel} ${operator.toLowerCase()} "${filter.value}"`
  }

  if (filter.type === "number") {
    return `${columnLabel} ${filter.operator} ${filter.value}`
  }

  const operator = DATE_OPERATOR_LABELS[filter.operator]
  return filter.operator === "between"
    ? `${columnLabel} ${operator.toLowerCase()} ${filter.value} and ${filter.secondValue ?? ""}`
    : `${columnLabel} ${operator.toLowerCase()} ${filter.value}`
}
