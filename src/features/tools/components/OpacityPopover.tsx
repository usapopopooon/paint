import { memo, useCallback } from 'react'
import { Ghost } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'
import { MIN_OPACITY, MAX_OPACITY } from '../constants'

type OpacityPopoverProps = {
  readonly opacity: number
  readonly onOpacityChange: (opacity: number) => void
  readonly onOpen?: () => void
}

export const OpacityPopover = memo(function OpacityPopover({
  opacity,
  onOpacityChange,
  onOpen,
}: OpacityPopoverProps) {
  const { t } = useLocale()
  const opacityPercent = Math.round(opacity * 100)

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const newOpacity = sliderValue / 100
        onOpacityChange(Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, newOpacity)))
      }
    },
    [onOpacityChange]
  )

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onOpen}
            >
              <Ghost className="size-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{t('tools.opacity')}</TooltipContent>
      </Tooltip>
      <PopoverContent side="right" align="center" className="w-40 p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('tools.opacity')}:</span>
            <span className="text-sm font-mono text-foreground">{opacityPercent}%</span>
          </div>
          <Slider
            orientation="horizontal"
            value={[opacityPercent]}
            onValueChange={handleSliderChange}
            min={0}
            max={100}
            step={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
})
