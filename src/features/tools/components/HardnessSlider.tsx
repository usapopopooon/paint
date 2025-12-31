import { memo, useCallback, useState } from 'react'
import { Disc, CircleSlash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'
import { MIN_HARDNESS, MAX_HARDNESS } from '../constants'

/** ぼかし無効時に保存しておくデフォルトのぼかし値 */
const DEFAULT_BLUR_VALUE = 0.5

type HardnessSliderProps = {
  readonly hardness: number
  readonly onHardnessChange: (hardness: number) => void
  readonly disabled?: boolean
}

export const HardnessSlider = memo(function HardnessSlider({
  hardness,
  onHardnessChange,
  disabled = false,
}: HardnessSliderProps) {
  const { t } = useLocale()
  const [isDragging, setIsDragging] = useState(false)

  // ぼかしが有効かどうか（hardness > 0）
  const isBlurEnabled = hardness > 0

  // ぼかし無効時に保存しておく値（トグルで復元するため）
  // useState初期化のみで、スライダー操作時にsetSavedHardnessを呼ぶ
  const [savedHardness, setSavedHardness] = useState<number>(
    hardness > 0 ? hardness : DEFAULT_BLUR_VALUE
  )

  // 表示用のパーセント（ぼかし有効時は実際の値、無効時は保存した値）
  const displayPercent = isBlurEnabled
    ? Math.round(hardness * 100)
    : Math.round(savedHardness * 100)

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const newHardness = sliderValue / 100
        const clampedHardness = Math.max(MIN_HARDNESS, Math.min(MAX_HARDNESS, newHardness))
        onHardnessChange(clampedHardness)
        // スライダーで値を変更したら保存
        if (clampedHardness > 0) {
          setSavedHardness(clampedHardness)
        }
      }
    },
    [onHardnessChange]
  )

  const handlePointerDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleToggleBlur = useCallback(() => {
    if (isBlurEnabled) {
      // ぼかし有効 → 無効（0にする）
      onHardnessChange(0)
    } else {
      // ぼかし無効 → 有効（保存した値を復元）
      onHardnessChange(savedHardness)
    }
  }, [isBlurEnabled, onHardnessChange, savedHardness])

  return (
    <Popover open={isDragging}>
      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center size-6">
              <Disc className="size-3.5 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">{t('tools.hardness')}</TooltipContent>
        </Tooltip>
        <PopoverAnchor asChild>
          <div className="flex-1">
            <Slider
              value={[displayPercent]}
              onValueChange={handleSliderChange}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              min={0}
              max={100}
              step={1}
              disabled={disabled || !isBlurEnabled}
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          side="right"
          align="center"
          className="w-auto p-2 pointer-events-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2">
            {/* ぼかしプレビュー */}
            <div className="relative size-8 flex items-center justify-center">
              <div
                className="size-6 rounded-full bg-foreground"
                style={{
                  filter: `blur(${displayPercent * 0.06}px)`,
                }}
              />
            </div>
            <span className="text-sm font-mono text-foreground w-10 text-right">
              {displayPercent}%
            </span>
          </div>
        </PopoverContent>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={handleToggleBlur}
              disabled={disabled}
            >
              <CircleSlash2
                className={`size-3.5 ${isBlurEnabled ? 'text-muted-foreground' : 'text-primary'}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isBlurEnabled ? t('tools.disableBlur') : t('tools.enableBlur')}
          </TooltipContent>
        </Tooltip>
      </div>
    </Popover>
  )
})
