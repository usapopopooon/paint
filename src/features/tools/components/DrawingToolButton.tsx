import { memo, useCallback } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { valueToSlider, sliderToValue } from '@/lib/slider'
import { OpacityPopover } from './OpacityPopover'

type DrawingToolButtonProps = {
  readonly isActive: boolean
  readonly width: number
  readonly opacity: number
  readonly onSelect: () => void
  readonly onWidthChange: (width: number) => void
  readonly onOpacityChange: (opacity: number) => void
  readonly icon: LucideIcon
  readonly translationKey: string
  readonly keyboardShortcut: string
  readonly minWidth: number
  readonly maxWidth: number
}

export const DrawingToolButton = memo(function DrawingToolButton({
  isActive,
  width,
  opacity,
  onSelect,
  onWidthChange,
  onOpacityChange,
  icon: Icon,
  translationKey,
  keyboardShortcut,
  minWidth,
  maxWidth,
}: DrawingToolButtonProps) {
  const { t } = useTranslation()
  const handleWidthSliderChange = useCallback(
    (values: number[]) => {
      onSelect()
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const newWidth = sliderToValue(sliderValue, minWidth, maxWidth)
        onWidthChange(newWidth)
      }
    },
    [onSelect, onWidthChange, minWidth, maxWidth]
  )

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? 'default' : 'secondary'}
            size="icon"
            className="size-6"
            onClick={onSelect}
            aria-label={t(translationKey)}
          >
            <Icon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {t(translationKey)} ({keyboardShortcut})
        </TooltipContent>
      </Tooltip>
      <div className="flex-1 flex items-center gap-1.5">
        <Slider
          value={[valueToSlider(width, minWidth, maxWidth)]}
          onValueChange={handleWidthSliderChange}
          onPointerDown={onSelect}
          min={0}
          max={100}
          step={0.1}
        />
        <span className="text-sm font-mono text-foreground w-8 text-right">{width}</span>
      </div>
      <OpacityPopover opacity={opacity} onOpacityChange={onOpacityChange} onOpen={onSelect} />
    </div>
  )
})
