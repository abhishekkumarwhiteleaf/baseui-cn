import type { NumericOperator } from "@/types/data-grid-filter"

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
