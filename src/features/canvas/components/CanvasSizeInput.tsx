import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/features/i18n'
import { MIN_CANVAS_SIZE, MAX_CANVAS_SIZE } from '../constants'

/** ホイールスクロール1回あたりの変化量（UI表示値） */
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
      const newValue = value + delta
      const clampedValue = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, newValue))
      onChange(clampedValue)
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
  const { t } = useTranslation()

  // 入力中の値を保持するローカルステート（空文字入力を許可するため）
  const [widthInput, setWidthInput] = useState(String(width))
  const [heightInput, setHeightInput] = useState(String(height))

  // propsの値が変わったらローカルステートを更新
  useEffect(() => {
    setWidthInput(String(width))
  }, [width])

  useEffect(() => {
    setHeightInput(String(height))
  }, [height])

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidthInput(e.target.value)
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightInput(e.target.value)
  }

  const commitWidth = () => {
    const value = parseInt(widthInput, 10)
    if (!isNaN(value) && value >= MIN_CANVAS_SIZE && value <= MAX_CANVAS_SIZE) {
      onWidthChange(value)
    } else {
      // 無効な値の場合は元の値に戻す
      setWidthInput(String(width))
    }
  }

  const commitHeight = () => {
    const value = parseInt(heightInput, 10)
    if (!isNaN(value) && value >= MIN_CANVAS_SIZE && value <= MAX_CANVAS_SIZE) {
      onHeightChange(value)
    } else {
      // 無効な値の場合は元の値に戻す
      setHeightInput(String(height))
    }
  }

  const handleWidthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitWidth()
      e.currentTarget.blur()
    }
  }

  const handleHeightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitHeight()
      e.currentTarget.blur()
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
          value={widthInput}
          onChange={handleWidthChange}
          onBlur={commitWidth}
          onKeyDown={handleWidthKeyDown}
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
          value={heightInput}
          onChange={handleHeightChange}
          onBlur={commitHeight}
          onKeyDown={handleHeightKeyDown}
          min={MIN_CANVAS_SIZE}
          max={MAX_CANVAS_SIZE}
          className="w-16 px-1.5 py-0.5 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
    </div>
  )
}
