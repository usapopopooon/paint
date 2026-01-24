import { memo, useCallback } from 'react'
import { Focus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { MIN_OPACITY, MAX_OPACITY } from '../constants'

type StrengthPopoverProps = {
  readonly strength: number
  readonly onStrengthChange: (strength: number) => void
  readonly onOpen?: () => void
}

export const StrengthPopover = memo(function StrengthPopover({
  strength,
  onStrengthChange,
  onOpen,
}: StrengthPopoverProps) {
  const { t } = useTranslation()
  const strengthPercent = Math.round(strength * 100)

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const newStrength = sliderValue / 100
        onStrengthChange(Math.max(MIN_OPACITY, Math.min(MAX_OPACITY, newStrength)))
      }
    },
    [onStrengthChange]
  )

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6" onClick={onOpen}>
              <Focus className="size-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">{t('tools.strength')}</TooltipContent>
      </Tooltip>
      <PopoverContent side="right" align="center" className="w-40 p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('tools.strength')}:</span>
            <span className="text-sm font-mono text-foreground">{strengthPercent}%</span>
          </div>
          <Slider
            orientation="horizontal"
            value={[strengthPercent]}
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
