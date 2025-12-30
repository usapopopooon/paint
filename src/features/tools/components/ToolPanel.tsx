import { memo, useCallback } from 'react'
import { Eraser, Eye, EyeOff, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ColorWheel } from '@/features/color'
import type { TranslationKey } from '@/features/i18n'
import type { Layer, LayerId } from '@/features/layer'
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
  readonly layers: readonly Layer[]
  readonly activeLayerId: LayerId
  readonly onLayerSelect: (id: LayerId) => void
  readonly onLayerVisibilityChange: (id: LayerId, isVisible: boolean) => void
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
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityChange,
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
          <TooltipContent side="right">{t('tools.pen')} (P)</TooltipContent>
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
          <TooltipContent side="right">{t('tools.eraser')} (E)</TooltipContent>
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

      {/* Layer panel */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">{t('layers.title')}</span>
        <div className="flex flex-col gap-1">
          {[...layers].reverse().map((layer) => (
            <div
              key={layer.id}
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                activeLayerId === layer.id ? 'bg-primary/20' : 'hover:bg-muted'
              }`}
              onClick={() => onLayerSelect(layer.id)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLayerVisibilityChange(layer.id, !layer.isVisible)
                    }}
                    aria-label={layer.isVisible ? t('layers.visible') : t('layers.hidden')}
                  >
                    {layer.isVisible ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {layer.isVisible ? t('layers.visible') : t('layers.hidden')}
                </TooltipContent>
              </Tooltip>
              <span className="text-sm text-foreground">
                {t('layers.layer')} {layer.name.replace(/\D/g, '')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
})
