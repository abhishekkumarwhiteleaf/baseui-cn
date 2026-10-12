export type FilterValidationResult = {
  valid: boolean
  error: string | null
}

export function validResult(): FilterValidationResult {
  return { valid: true, error: null }
}

export function invalidResult(error: string): FilterValidationResult {
  return { valid: false, error }
}
