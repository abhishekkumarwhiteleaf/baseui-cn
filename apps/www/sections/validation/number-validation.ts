import type { NumericOperator } from "@/types/data-grid-filter"
import { invalidResult, validResult, type FilterValidationResult } from "./validation-result"

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
