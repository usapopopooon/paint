import { memo, useCallback } from 'react'
import { Eraser, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ColorWheel } from '@/features/color'
import type { TranslationKey } from '@/features/i18n'
import { valueToSlider, sliderToValue } from '@/lib/slider'
import type { ToolType, PenToolConfig, EraserToolConfig } from '../types'

const MIN_PEN_WIDTH = 1
const MAX_PEN_WIDTH = 300
const MIN_ERASER_WIDTH = 5
const MAX_ERASER_WIDTH = 300

type ToolPanelProps = {
  readonly currentType: ToolType
  readonly penConfig: PenToolConfig
  readonly eraserConfig: EraserToolConfig
  readonly onToolTypeChange: (type: ToolType) => void
  readonly onPenWidthChange: (width: number) => void
  readonly onPenColorChange: (color: string) => void
  readonly onEraserWidthChange: (width: number) => void
  readonly t: (key: TranslationKey) => string
}

/**
 * ツールパネルコンポーネント
 * カラーピッカー、ペンツール、消しゴムツールを管理
 */
export const ToolPanel = memo(function ToolPanel({
  currentType,
  penConfig,
  eraserConfig,
  onToolTypeChange,
  onPenWidthChange,
  onPenColorChange,
  onEraserWidthChange,
  t,
}: ToolPanelProps) {
  /**
   * ペンスライダー変更時のハンドラ
   * @param values - スライダーの値配列
   */
  const handlePenSliderChange = useCallback(
    (values: number[]) => {
      onToolTypeChange('pen')
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const width = sliderToValue(sliderValue, MIN_PEN_WIDTH, MAX_PEN_WIDTH)
        onPenWidthChange(width)
      }
    },
    [onToolTypeChange, onPenWidthChange]
  )

  /**
   * 消しゴムスライダー変更時のハンドラ
   * @param values - スライダーの値配列
   */
  const handleEraserSliderChange = useCallback(
    (values: number[]) => {
      onToolTypeChange('eraser')
      const sliderValue = values[0]
      if (sliderValue !== undefined) {
        const width = sliderToValue(sliderValue, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)
        onEraserWidthChange(width)
      }
    },
    [onToolTypeChange, onEraserWidthChange]
  )

  /** ペンツールを選択 */
  const handleSelectPen = useCallback(() => {
    onToolTypeChange('pen')
  }, [onToolTypeChange])

  /** 消しゴムツールを選択 */
  const handleSelectEraser = useCallback(() => {
    onToolTypeChange('eraser')
  }, [onToolTypeChange])

  return (
    <aside className="w-[232px] p-4 border-r border-zinc-300 dark:border-border bg-zinc-200 dark:bg-background flex flex-col gap-6">
      {/* Color picker */}
      <ColorWheel color={penConfig.color} onChange={onPenColorChange} t={t} />

      {/* Pen tool */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentType === 'pen' ? 'default' : 'secondary'}
              size="sm"
              onClick={handleSelectPen}
              aria-label={t('tools.pen')}
            >
              <Pencil className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t('tools.pen')}</TooltipContent>
        </Tooltip>
        <div className="flex-1 flex items-center gap-2">
          <Slider
            value={[valueToSlider(penConfig.width, MIN_PEN_WIDTH, MAX_PEN_WIDTH)]}
            onValueChange={handlePenSliderChange}
            min={0}
            max={100}
            step={0.1}
          />
          <span className="text-sm font-mono text-foreground w-8 text-right">
            {penConfig.width}
          </span>
        </div>
      </div>

      {/* Eraser tool */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentType === 'eraser' ? 'default' : 'secondary'}
              size="sm"
              onClick={handleSelectEraser}
              aria-label={t('tools.eraser')}
            >
              <Eraser className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t('tools.eraser')}</TooltipContent>
        </Tooltip>
        <div className="flex-1 flex items-center gap-2">
          <Slider
            value={[valueToSlider(eraserConfig.width, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)]}
            onValueChange={handleEraserSliderChange}
            min={0}
            max={100}
            step={0.1}
          />
          <span className="text-sm font-mono text-foreground w-8 text-right">
            {eraserConfig.width}
          </span>
        </div>
      </div>
    </aside>
  )
})
