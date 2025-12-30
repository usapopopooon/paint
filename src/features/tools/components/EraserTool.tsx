import { memo, useCallback } from 'react'
import { Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'
import { valueToSlider, sliderToValue } from '@/lib/slider'
import { MIN_ERASER_WIDTH, MAX_ERASER_WIDTH } from '../constants'

type EraserToolProps = {
  readonly isActive: boolean
  readonly width: number
  readonly onSelect: () => void
  readonly onWidthChange: (width: number) => void
}

export const EraserTool = memo(function EraserTool({
  isActive,
  width,
  onSelect,
  onWidthChange,
}: EraserToolProps) {
  const { t } = useLocale()
  const handleSliderChange = useCallback(
    (values: number[]) => {
      onSelect()
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const newWidth = sliderToValue(sliderValue, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)
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
            aria-label={t('tools.eraser')}
          >
            <Eraser className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{t('tools.eraser')} (E)</TooltipContent>
      </Tooltip>
      <div className="flex-1 flex items-center gap-1.5">
        <Slider
          value={[valueToSlider(width, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)]}
          onValueChange={handleSliderChange}
          onPointerDown={onSelect}
          min={0}
          max={100}
          step={0.1}
        />
        <span className="text-sm font-mono text-foreground w-8 text-right">{width}</span>
      </div>
    </div>
  )
})
