import { useCallback } from 'react'
import { useLocale } from '@/features/i18n'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components'
import { AnchorSelector } from './AnchorSelector'
import type { ResizeAnchor } from '../types'
import { MIN_CANVAS_SIZE, MAX_CANVAS_SIZE } from '../hooks/useCanvasSize'

/** ホイールスクロール1回あたりの変化量 */
const WHEEL_STEP = 10

/**
 * リサイズアイコン（Scale/Resize風）
 */
const ResizeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)

/**
 * CanvasResizeMenuコンポーネントのプロパティ
 */
type CanvasResizeMenuProps = {
  readonly width: number
  readonly height: number
  readonly anchor: ResizeAnchor
  readonly onWidthChange: (width: number) => void
  readonly onHeightChange: (height: number) => void
  readonly onAnchorChange: (anchor: ResizeAnchor) => void
}

/**
 * キャンバスリサイズメニューコンポーネント（ドロップダウン形式）
 */
export const CanvasResizeMenu = ({
  width,
  height,
  anchor,
  onWidthChange,
  onHeightChange,
  onAnchorChange,
}: CanvasResizeMenuProps) => {
  const { t } = useLocale()

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      onWidthChange(value)
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      onHeightChange(value)
    }
  }

  const handleWidthWheel = useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP
      const newValue = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, width + delta))
      onWidthChange(newValue)
    },
    [width, onWidthChange]
  )

  const handleHeightWheel = useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP
      const newValue = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, height + delta))
      onHeightChange(newValue)
    },
    [height, onHeightChange]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" aria-label={t('canvas.resize')}>
          <ResizeIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-auto min-w-[200px]">
        {/* アンカーセレクター */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{t('canvas.anchor')}</span>
          <AnchorSelector value={anchor} onChange={onAnchorChange} />
        </div>

        {/* サイズ入力 */}
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t('canvas.width')}</span>
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              onWheel={handleWidthWheel}
              min={MIN_CANVAS_SIZE}
              max={MAX_CANVAS_SIZE}
              className="w-20 px-2 py-1 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t('canvas.height')}</span>
            <input
              type="number"
              value={height}
              onChange={handleHeightChange}
              onWheel={handleHeightWheel}
              min={MIN_CANVAS_SIZE}
              max={MAX_CANVAS_SIZE}
              className="w-20 px-2 py-1 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
