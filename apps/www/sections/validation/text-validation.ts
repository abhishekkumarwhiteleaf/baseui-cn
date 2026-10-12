import type { TextOperator } from "@/types/data-grid-filter"
import { invalidResult, validResult, type FilterValidationResult } from "./validation-result"

export function validateTextFilter(operator: TextOperator, value: string): FilterValidationResult {
  const trimmedValue = value.trim()

  if (operator === "blank" || operator === "notBlank") {
    return trimmedValue ? invalidResult("This operator does not require a value.") : validResult()
  }

  return trimmedValue ? validResult() : invalidResult("Please enter a text value.")
}
