import { memo, useCallback } from 'react'
import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { MIN_STABILIZATION, MAX_STABILIZATION } from '../constants'

type StabilizationSliderProps = {
  readonly stabilization: number
  readonly onStabilizationChange: (stabilization: number) => void
  readonly disabled?: boolean
}

export const StabilizationSlider = memo(function StabilizationSlider({
  stabilization,
  onStabilizationChange,
  disabled = false,
}: StabilizationSliderProps) {
  const { t } = useTranslation()

  // 内部値(0-0.2)をUI表示用(0-100%)に変換
  const displayPercent = Math.round((stabilization / MAX_STABILIZATION) * 100)
  const isActive = stabilization > 0

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        // UI値(0-100%)を内部値(0-0.2)に変換
        const newStabilization = (sliderValue / 100) * MAX_STABILIZATION
        const clampedStabilization = Math.max(
          MIN_STABILIZATION,
          Math.min(MAX_STABILIZATION, newStabilization)
        )
        onStabilizationChange(clampedStabilization)
      }
    },
    [onStabilizationChange]
  )

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="icon" disabled={disabled}>
              <PenLine className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('stabilization.title')}</TooltipContent>
      </Tooltip>
      <PopoverContent align="center" className="w-auto min-w-[200px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">{t('stabilization.title')}</span>
          <div className="flex items-center gap-2">
            <Slider
              value={[displayPercent]}
              onValueChange={handleSliderChange}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              className="w-24"
            />
            <span className="text-sm font-mono text-foreground w-10 text-right">
              {displayPercent}%
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})
