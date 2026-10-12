import type { DateOperator } from "@/types/data-grid-filter"

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
