import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { MIN_STABILIZATION, MAX_STABILIZATION } from '../constants'

/** ペンが線を引いているアイコン（手ぶれ補正用） */
const PenDrawingIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* ペン本体（斜め） */}
    <path d="M17 3l4 4L7.5 20.5 2 22l1.5-5.5z" />
    {/* ペン先の区切り線 */}
    <path d="M15 5l4 4" />
    {/* ペンの下の線（アイコン全幅） */}
    <line x1="0" y1="24" x2="24" y2="24" />
  </svg>
)

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

  const displayPercent = Math.round(stabilization * 100)
  const isActive = stabilization > 0

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const newStabilization = sliderValue / 100
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
              <PenDrawingIcon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
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
