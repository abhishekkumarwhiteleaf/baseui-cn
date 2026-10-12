import type { TextOperator } from "@/types/data-grid-filter"
import { matchesTextFilter } from "./matching/text-matching"

export const TEXT_OPERATORS: readonly TextOperator[] = [
  "contains",
  "notContains",
  "equals",
  "notEquals",
  "startsWith",
  "endsWith",
  "blank",
  "notBlank",
]

export const TEXT_OPERATOR_LABELS: Record<TextOperator, string> = {
  contains: "Contains",
  notContains: "Does not contain",
  equals: "Equals",
  notEquals: "Does not equal",
  startsWith: "Starts with",
  endsWith: "Ends with",
  blank: "Is blank",
  notBlank: "Is not blank",
}

export { matchesTextFilter }
