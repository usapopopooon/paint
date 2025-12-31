import { useState, useEffect, useRef } from 'react'
import { useLocale } from '@/features/i18n'
import { toDisplayValue, toInternalValue } from '@/utils'
import { MIN_CANVAS_SIZE, MAX_CANVAS_SIZE } from '../constants'

/** ホイールスクロール1回あたりの変化量（UI表示値） */
const WHEEL_STEP = 10

/**
 * ホイールイベントでpreventDefaultを使用するためのカスタムフック
 * passive: false でイベントリスナーを登録する
 * displayValue: UI表示値（内部値の1/2）
 * onChange: 内部値で呼ばれる
 */
const useWheelHandler = (
  displayValue: number,
  onChange: (internalValue: number) => void
): React.RefObject<HTMLInputElement | null> => {
  const ref = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP
      const newDisplayValue = displayValue + delta
      const newInternalValue = toInternalValue(newDisplayValue)
      const clampedValue = Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, newInternalValue))
      onChange(clampedValue)
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [displayValue, onChange])

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

  // UI表示値（内部値の1/2）
  const displayWidth = toDisplayValue(width)
  const displayHeight = toDisplayValue(height)
  const minDisplaySize = toDisplayValue(MIN_CANVAS_SIZE)
  const maxDisplaySize = toDisplayValue(MAX_CANVAS_SIZE)

  // 入力中の値を保持するローカルステート（空文字入力を許可するため）
  const [widthInput, setWidthInput] = useState(String(displayWidth))
  const [heightInput, setHeightInput] = useState(String(displayHeight))

  // propsの値が変わったらローカルステートを更新
  useEffect(() => {
    setWidthInput(String(displayWidth))
  }, [displayWidth])

  useEffect(() => {
    setHeightInput(String(displayHeight))
  }, [displayHeight])

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidthInput(e.target.value)
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightInput(e.target.value)
  }

  const commitWidth = () => {
    const displayValue = parseInt(widthInput, 10)
    if (!isNaN(displayValue) && displayValue >= minDisplaySize && displayValue <= maxDisplaySize) {
      onWidthChange(toInternalValue(displayValue))
    } else {
      // 無効な値の場合は元の値に戻す
      setWidthInput(String(displayWidth))
    }
  }

  const commitHeight = () => {
    const displayValue = parseInt(heightInput, 10)
    if (!isNaN(displayValue) && displayValue >= minDisplaySize && displayValue <= maxDisplaySize) {
      onHeightChange(toInternalValue(displayValue))
    } else {
      // 無効な値の場合は元の値に戻す
      setHeightInput(String(displayHeight))
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

  const widthInputRef = useWheelHandler(displayWidth, onWidthChange)
  const heightInputRef = useWheelHandler(displayHeight, onHeightChange)

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
          min={minDisplaySize}
          max={maxDisplaySize}
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
          min={minDisplaySize}
          max={maxDisplaySize}
          className="w-16 px-1.5 py-0.5 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
    </div>
  )
}
