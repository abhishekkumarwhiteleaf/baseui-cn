"use client"

import { useId } from "react"
import { ChevronDownIcon, CircleHelpIcon, Settings2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface DataGridFeatureControl<TFeature extends string = string> {
  id: TFeature
  label: string
  checked: boolean
}

export interface DataGridFeatureControlsProps<TFeature extends string = string> {
  features: readonly DataGridFeatureControl<TFeature>[]
  onFeatureChange: (feature: TFeature, checked: boolean) => void
  label?: string
  helpText?: string
  className?: string
}

export function DataGridFeatureControls<TFeature extends string = string>({
  features,
  onFeatureChange,
  label = "Table features",
  helpText = "Enable or disable features to customize the table.",
  className,
}: DataGridFeatureControlsProps<TFeature>) {
  const instanceId = useId()

  const featureGroups: {
    label: string
    ids: TFeature[]
  }[] = [
    {
      label: "Filtering",
      ids: ["excelFilters" as TFeature],
    },
    {
      label: "Rows",
      ids: ["rowPinning", "rowReordering"] as TFeature[],
    },
    {
      label: "Columns",
      ids: ["columnPinning", "columnReordering", "columnDragAndDrop"] as TFeature[],
    },
    {
      label: "Editing",
      ids: ["inlineEditing" as TFeature],
    },
  ]

  const groupedFeatures = featureGroups
    .map((group) => ({
      ...group,
      features: features.filter((feature) => group.ids.includes(feature.id)),
    }))
    .filter((group) => group.features.length > 0)

  const groupedIds = new Set(
    groupedFeatures.flatMap((group) => group.features.map((feature) => feature.id))
  )

  const ungroupedFeatures = features.filter((feature) => !groupedIds.has(feature.id))

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm">
              <Settings2Icon aria-hidden="true" />
              {label}
              <ChevronDownIcon aria-hidden="true" />
            </Button>
          }
        />

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 pb-1">
              <span>{label}</span>
            </DropdownMenuLabel>

            {groupedFeatures.map((group, index) => (
              <div key={group.label}>
                {index > 0 && <DropdownMenuSeparator />}

                <div className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </div>

                <div className="space-y-0.5">
                  {group.features.map((feature) => {
                    const id = `${instanceId}-${feature.id}`

                    return (
                      <Label
                        key={feature.id}
                        htmlFor={id}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-accent"
                      >
                        <span>{feature.label}</span>
                        <Checkbox
                          id={id}
                          checked={feature.checked}
                          onCheckedChange={(checked) =>
                            onFeatureChange(feature.id, checked === true)
                          }
                        />
                      </Label>
                    )
                  })}
                </div>
              </div>
            ))}

            {ungroupedFeatures.length > 0 && (
              <>
                {groupedFeatures.length > 0 && <DropdownMenuSeparator />}

                <div className="space-y-0.5 pt-1">
                  {ungroupedFeatures.map((feature) => {
                    const id = `${instanceId}-${feature.id}`

                    return (
                      <Label
                        key={feature.id}
                        htmlFor={id}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-accent"
                      >
                        <span>{feature.label}</span>
                        <Checkbox
                          id={id}
                          checked={feature.checked}
                          onCheckedChange={(checked) =>
                            onFeatureChange(feature.id, checked === true)
                          }
                        />
                      </Label>
                    )
                  })}
                </div>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label={`About ${label.toLowerCase()}`}>
                <CircleHelpIcon aria-hidden="true" />
              </Button>
            }
          />
          <TooltipContent>{helpText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
