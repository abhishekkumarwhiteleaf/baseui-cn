import type { TextOperator } from "@/types/data-grid-filter"

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
