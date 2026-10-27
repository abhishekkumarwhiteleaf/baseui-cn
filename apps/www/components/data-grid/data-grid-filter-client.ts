import type { FilterFn, RowData } from "@tanstack/react-table"
import type {
  ColumnFilterState,
  DateOperator,
  NumericOperator,
  TextOperator,
} from "@/types/data-grid-filter"
import type { DataGridFeatures } from "@/components/data-grid/table-features"

export type FilterValidationResult = {
  valid: boolean
  error: string | null
}

export const DATE_OPERATORS: readonly DateOperator[] = ["before", "after", "on", "between"]

export const DATE_OPERATOR_LABELS: Record<DateOperator, string> = {
  before: "Before",
  after: "After",
  on: "On",
  between: "Between",
}

export const NUMERIC_OPERATORS: readonly NumericOperator[] = ["=", ">", "<", ">=", "<="]

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

export function matchesTextFilter(value: unknown, operator: TextOperator, query: string): boolean {
  const actual = String(value ?? "")
    .trim()
    .toLowerCase()
  const expected = query.trim().toLowerCase()

  switch (operator) {
    case "blank":
      return actual === ""
    case "notBlank":
      return actual !== ""
    case "contains":
      return actual.includes(expected)
    case "notContains":
      return !actual.includes(expected)
    case "equals":
      return actual === expected
    case "notEquals":
      return actual !== expected
    case "startsWith":
      return actual.startsWith(expected)
    case "endsWith":
      return actual.endsWith(expected)
  }
}

export function matchesNumberFilter(
  value: unknown,
  operator: NumericOperator,
  query: string
): boolean {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    query.trim() === ""
  ) {
    return false
  }

  const actual = Number(value)
  const expected = Number(query)

  if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
    return false
  }

  switch (operator) {
    case "=":
      return actual === expected
    case ">":
      return actual > expected
    case "<":
      return actual < expected
    case ">=":
      return actual >= expected
    case "<=":
      return actual <= expected
  }
}

function toDateKey(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ""
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-")
  }

  const date = String(value ?? "").slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : ""
}

export function matchesDateFilter(
  value: unknown,
  operator: DateOperator,
  query: string,
  secondQuery?: string
): boolean {
  const actualDate = toDateKey(value)
  if (!actualDate || !query) return false

  switch (operator) {
    case "before":
      return actualDate < query
    case "after":
      return actualDate > query
    case "on":
      return actualDate === query
    case "between":
      return Boolean(secondQuery && actualDate >= query && actualDate <= secondQuery)
  }
}

function validResult(): FilterValidationResult {
  return { valid: true, error: null }
}

function invalidResult(error: string): FilterValidationResult {
  return { valid: false, error }
}

export function validateTextFilter(
  operator: TextOperator,
  value: string
): FilterValidationResult {
  const trimmedValue = value.trim()

  if (operator === "blank" || operator === "notBlank") {
    return trimmedValue ? invalidResult("This operator does not require a value.") : validResult()
  }

  return trimmedValue ? validResult() : invalidResult("Please enter a text value.")
}

export function validateNumberFilter(
  _operator: NumericOperator,
  value: string
): FilterValidationResult {
  if (value.trim() === "") {
    return invalidResult("Please enter a number.")
  }

  return Number.isFinite(Number(value))
    ? validResult()
    : invalidResult("Please enter a valid number.")
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false

  const [year, month, day] = value.split("-").map(Number)
  if (year < 1 || month < 1 || month > 12) return false
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= daysInMonth[month - 1]
}

export function validateDateFilter(
  operator: DateOperator,
  value: string,
  secondValue?: string
): FilterValidationResult {
  const firstDate = value.trim()
  const endDate = secondValue?.trim() ?? ""

  if (!firstDate) return invalidResult("Please select a date.")
  if (!isValidDate(firstDate)) return invalidResult("Please select a valid date.")
  if (operator !== "between") return validResult()
  if (!endDate) return invalidResult("Please select an end date.")
  if (!isValidDate(endDate)) return invalidResult("Please select a valid end date.")
  if (firstDate > endDate) {
    return invalidResult("The start date cannot be after the end date.")
  }
  return validResult()
}

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

export function createExcelFilterFn<TData extends RowData>(): FilterFn<DataGridFeatures, TData> {
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
