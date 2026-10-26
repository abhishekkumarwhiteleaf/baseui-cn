"use client"

import { useCallback, useState } from "react"
import type { RowData } from "@tanstack/react-table"
import { FilterIcon, ListFilterIcon, SearchIcon, XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePickerInput } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DATE_OPERATORS,
  DATE_OPERATOR_LABELS,
  NUMERIC_OPERATORS,
  TEXT_OPERATORS,
  TEXT_OPERATOR_LABELS,
  formatFilterLabel,
} from "@/sections/common-filters"
import { validateDateFilter, validateNumberFilter, validateTextFilter } from "@/sections/validation"
import type {
  ColumnFilterState,
  DateOperator,
  ExcelFilterType,
  NumericOperator,
  TextOperator,
} from "@/types/data-grid-filter"
import type { DataGridColumn } from "@/components/data-grid/table-features"
import { getColumnHeaderLabel, useDataGrid } from "@/components/data-grid/data-grid"

export interface DataGridFilterMenuProps<TData extends RowData, TValue> {
  column: DataGridColumn<TData, TValue>
  type: ExcelFilterType
  title?: string
}

function toDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function fromDate(value: Date | undefined) {
  if (!value) return ""
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate()
  ).padStart(2, "0")}`
}

function initialFilter(type: ExcelFilterType, value: unknown): ColumnFilterState {
  if (typeof value === "object" && value !== null && "type" in value && value.type === type) {
    return value as ColumnFilterState
  }

  if (type === "text") return { type, operator: "contains", value: "" }
  if (type === "number") return { type, operator: ">", value: "" }
  return { type, operator: "on", value: "", secondValue: "" }
}

function isColumnFilterState(value: unknown): value is ColumnFilterState {
  if (typeof value !== "object" || value === null || !("type" in value)) return false
  if (!("operator" in value) || !("value" in value)) return false

  return (
    (value.type === "text" || value.type === "number" || value.type === "date") &&
    typeof value.operator === "string" &&
    typeof value.value === "string"
  )
}

export function DataGridActiveFilters() {
  const { table } = useDataGrid()
  const [showFilters, setShowFilters] = useState(true)
  const activeFilters = table.store.state.columnFilters
    .map((filter) => {
      const column = table.getColumn(filter.id)
      if (!column) return null

      const label = isColumnFilterState(filter.value)
        ? formatFilterLabel(getColumnHeaderLabel(column), filter.value)
        : `${getColumnHeaderLabel(column)} is filtered`

      return { id: filter.id, label }
    })
    .filter((filter): filter is { id: string; label: string } => filter !== null)

  if (!activeFilters.length) return null

  const clearAll = () => {
    for (const filter of activeFilters) {
      table.getColumn(filter.id)?.setFilterValue(undefined)
    }
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        aria-expanded={showFilters}
        onClick={() => setShowFilters((visible) => !visible)}
      >
        <ListFilterIcon />
        Active filters
        <Badge variant="secondary" className="ms-1">
          {activeFilters.length}
        </Badge>
      </Button>
      <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={clearAll}>
        Clear all
      </Button>
      {showFilters && (
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="max-w-full gap-1 py-1">
              <span className="truncate">{filter.label}</span>
              <button
                type="button"
                className="rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${filter.label}`}
                title={`Remove ${filter.label}`}
                onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
              >
                <XIcon />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function OperatorSelect<TOperator extends string>({
  value,
  operators,
  labelFor,
  onChange,
}: {
  value: TOperator
  operators: readonly TOperator[]
  labelFor: (operator: TOperator) => string
  onChange: (operator: TOperator) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => nextValue && onChange(nextValue as TOperator)}
    >
      <SelectTrigger size="sm" className="mb-2 h-8 w-full text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {operators.map((operator) => (
          <SelectItem key={operator} value={operator}>
            {labelFor(operator)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function DataGridFilterMenu<TData extends RowData, TValue>({
  column,
  type,
  title,
}: DataGridFilterMenuProps<TData, TValue>) {
  const [open, setOpen] = useState(false)
  const [collisionBoundary, setCollisionBoundary] = useState<HTMLElement | null>(null)
  const [draft, setDraft] = useState<ColumnFilterState>(() =>
    initialFilter(type, column.getFilterValue())
  )
  const [error, setError] = useState<string | null>(null)
  const activeFilter = column.getFilterValue() !== undefined
  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    const viewport = node?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]') ?? null

    setCollisionBoundary((current) => (current === viewport ? current : viewport))
  }, [])

  const updateDraft = (nextDraft: ColumnFilterState) => {
    setDraft(nextDraft)
    setError(null)
  }

  const apply = () => {
    const result =
      draft.type === "text"
        ? validateTextFilter(draft.operator, draft.value)
        : draft.type === "number"
          ? validateNumberFilter(draft.operator, draft.value)
          : validateDateFilter(draft.operator, draft.value, draft.secondValue)

    if (!result.valid) {
      setError(result.error)
      return
    }

    column.setFilterValue(draft)
    setError(null)
    setOpen(false)
  }

  const clear = () => {
    column.setFilterValue(undefined)
    setDraft(initialFilter(type, undefined))
    setError(null)
    setOpen(false)
  }

  const resolvedTitle = title ?? column.id

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDraft(initialFilter(type, column.getFilterValue()))
          setError(null)
        }
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger
        render={
          <Button
            ref={setTriggerRef}
            variant={activeFilter ? "secondary" : "ghost"}
            size="icon-xs"
            aria-label={`Filter ${resolvedTitle}`}
            title={`Filter ${resolvedTitle}`}
            disabled={!column.getCanFilter()}
          />
        }
      >
        <FilterIcon className={activeFilter ? "text-primary" : "text-muted-foreground"} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionBoundary={collisionBoundary ?? "clipping-ancestors"}
        collisionPadding={8}
        collisionAvoidance={{
          side: "flip",
          align: "shift",
        }}
        sticky={false}
        disableAnchorTracking={false}
        positionMethod="fixed"
        className="max-h-[min(24rem,calc(100dvh-1rem))] w-[min(14rem,calc(100vw-1rem))] gap-0 overflow-y-auto p-3"
      >
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Filter {resolvedTitle}
        </div>

        {draft.type === "text" && (
          <>
            <OperatorSelect<TextOperator>
              value={draft.operator}
              operators={TEXT_OPERATORS}
              labelFor={(operator) => TEXT_OPERATOR_LABELS[operator]}
              onChange={(operator) => updateDraft({ ...draft, operator })}
            />
            {draft.operator !== "blank" && draft.operator !== "notBlank" && (
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-2 top-2 size-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={draft.value}
                  onChange={(event) => updateDraft({ ...draft, value: event.target.value })}
                  placeholder="Enter text"
                  className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            )}
          </>
        )}

        {draft.type === "number" && (
          <>
            <OperatorSelect<NumericOperator>
              value={draft.operator}
              operators={NUMERIC_OPERATORS}
              labelFor={(operator) => operator}
              onChange={(operator) => updateDraft({ ...draft, operator })}
            />
            <input
              type="number"
              value={draft.value}
              onChange={(event) => updateDraft({ ...draft, value: event.target.value })}
              placeholder="Enter value"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </>
        )}

        {draft.type === "date" && (
          <>
            <OperatorSelect<DateOperator>
              value={draft.operator}
              operators={DATE_OPERATORS}
              labelFor={(operator) => DATE_OPERATOR_LABELS[operator]}
              onChange={(operator) => updateDraft({ ...draft, operator })}
            />
            <DatePickerInput
              value={toDate(draft.value)}
              onValueChange={(value) => updateDraft({ ...draft, value: fromDate(value) })}
              formatPreset="iso"
              size="sm"
              placeholder="Select date"
              triggerClassName="h-8 text-xs"
            />
            {draft.operator === "between" && (
              <DatePickerInput
                value={toDate(draft.secondValue ?? "")}
                onValueChange={(value) => updateDraft({ ...draft, secondValue: fromDate(value) })}
                formatPreset="iso"
                size="sm"
                placeholder="Select end date"
                triggerClassName="mt-2 h-8 text-xs"
              />
            )}
          </>
        )}

        {error && <p className="mt-2 text-xs leading-4 text-destructive">{error}</p>}

        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={clear}>
            Clear
          </Button>

          <Button size="sm" className="flex-1" onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
