import type { NumericOperator } from "@/types/data-grid-filter"
import { matchesNumberFilter } from "./matching/number-matching"

export const NUMERIC_OPERATORS: readonly NumericOperator[] = ["=", ">", "<", ">=", "<="]

export { matchesNumberFilter }
