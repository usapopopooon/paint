import { useEffect, useRef } from 'react'
import { useLocale } from '@/features/i18n'
import { MIN_CANVAS_SIZE, MAX_CANVAS_SIZE } from '../hooks/useCanvasSize'

/** ホイールスクロール1回あたりの変化量 */
const WHEEL_STEP = 10

/**
 * ホイールイベントでpreventDefaultを使用するためのカスタムフック
 * passive: false でイベントリスナーを登録する
 */
const useWheelHandler = (
  value: number,
  onChange: (value: number) => void
): React.RefObject<HTMLInputElement | null> => {
  const ref = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP
      const newValue = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, value + delta))
      onChange(newValue)
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [value, onChange])

  return ref
}

/**
 * CanvasSizeInputコンポーネントのプロパティ
 */
type CanvasSizeInputProps = {
  readonly width: number
  readonly height: number
  readonly onWidthChange: (width: number) => void
  readonly onHeightChange: (height: number) => void
}

/**
 * キャンバスサイズ入力コンポーネント
 * @param props - CanvasSizeInputコンポーネントのプロパティ
 */
export const CanvasSizeInput = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
}: CanvasSizeInputProps) => {
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

  const widthInputRef = useWheelHandler(width, onWidthChange)
  const heightInputRef = useWheelHandler(height, onHeightChange)

  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="flex items-center gap-1">
        <span className="text-muted-foreground">{t('canvas.width')}:</span>
        <input
          ref={widthInputRef}
          type="number"
          value={width}
          onChange={handleWidthChange}
          min={MIN_CANVAS_SIZE}
          max={MAX_CANVAS_SIZE}
          className="w-16 px-1.5 py-0.5 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
      <span className="text-muted-foreground">x</span>
      <label className="flex items-center gap-1">
        <span className="text-muted-foreground">{t('canvas.height')}:</span>
        <input
          ref={heightInputRef}
          type="number"
          value={height}
          onChange={handleHeightChange}
          min={MIN_CANVAS_SIZE}
          max={MAX_CANVAS_SIZE}
          className="w-16 px-1.5 py-0.5 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
    </div>
  )
}
