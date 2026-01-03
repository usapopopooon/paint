import { memo, useCallback } from 'react'
import { Brush } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { valueToSlider, sliderToValue } from '@/lib/slider'
import { MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH } from '../constants'
import { OpacityPopover } from './OpacityPopover'

type BrushToolProps = {
  readonly isActive: boolean
  readonly width: number
  readonly opacity: number
  readonly onSelect: () => void
  readonly onWidthChange: (width: number) => void
  readonly onOpacityChange: (opacity: number) => void
}

export const BrushTool = memo(function BrushTool({
  isActive,
  width,
  opacity,
  onSelect,
  onWidthChange,
  onOpacityChange,
}: BrushToolProps) {
  const { t } = useTranslation()
  const handleWidthSliderChange = useCallback(
    (values: number[]) => {
      onSelect()
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const newWidth = sliderToValue(sliderValue, MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH)
        onWidthChange(newWidth)
      }
    },
    [onSelect, onWidthChange]
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
            aria-label={t('tools.brush')}
          >
            <Brush className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{t('tools.brush')} (B)</TooltipContent>
      </Tooltip>
      <div className="flex-1 flex items-center gap-1.5">
        <Slider
          value={[valueToSlider(width, MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH)]}
          onValueChange={handleWidthSliderChange}
          onPointerDown={onSelect}
          min={0}
          max={100}
          step={0.1}
        />
        <span className="text-sm font-mono text-foreground w-8 text-right">
          {width}
        </span>
      </div>
      <OpacityPopover opacity={opacity} onOpacityChange={onOpacityChange} onOpen={onSelect} />
    </div>
  )
})
