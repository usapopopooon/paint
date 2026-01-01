import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useLocale } from '@/features/i18n'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AnchorSelector } from './AnchorSelector'
import type { ResizeAnchor } from '../types'
import { MIN_CANVAS_SIZE, MAX_CANVAS_SIZE } from '../constants'
import { toDisplayValue, toInternalValue } from '@/utils'

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
 * リサイズアイコン（Expand）
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
    <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
    <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
    <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
    <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
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
    if (isNaN(displayValue)) {
      toast.error(t('canvas.invalidSize'))
      setWidthInput(String(displayWidth))
    } else if (displayValue < minDisplaySize) {
      toast.error(t('canvas.sizeTooSmall', { min: minDisplaySize }))
      setWidthInput(String(displayWidth))
    } else if (displayValue > maxDisplaySize) {
      toast.error(t('canvas.sizeTooLarge', { max: maxDisplaySize }))
      setWidthInput(String(displayWidth))
    } else {
      onWidthChange(toInternalValue(displayValue))
    }
  }

  const commitHeight = () => {
    const displayValue = parseInt(heightInput, 10)
    if (isNaN(displayValue)) {
      toast.error(t('canvas.invalidSize'))
      setHeightInput(String(displayHeight))
    } else if (displayValue < minDisplaySize) {
      toast.error(t('canvas.sizeTooSmall', { min: minDisplaySize }))
      setHeightInput(String(displayHeight))
    } else if (displayValue > maxDisplaySize) {
      toast.error(t('canvas.sizeTooLarge', { max: maxDisplaySize }))
      setHeightInput(String(displayHeight))
    } else {
      onHeightChange(toInternalValue(displayValue))
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
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="icon" aria-label={t('canvas.resize')}>
              <ResizeIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('canvas.resize')}</TooltipContent>
      </Tooltip>
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
            <div className="flex items-center">
              <input
                ref={widthInputRef}
                type="number"
                value={widthInput}
                onChange={handleWidthChange}
                onBlur={commitWidth}
                onKeyDown={handleWidthKeyDown}
                min={minDisplaySize}
                max={maxDisplaySize}
                className="w-20 px-2 py-1 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground ml-1">px</span>
            </div>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t('canvas.height')}</span>
            <div className="flex items-center">
              <input
                ref={heightInputRef}
                type="number"
                value={heightInput}
                onChange={handleHeightChange}
                onBlur={commitHeight}
                onKeyDown={handleHeightKeyDown}
                min={minDisplaySize}
                max={maxDisplaySize}
                className="w-20 px-2 py-1 rounded border border-input bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground ml-1">px</span>
            </div>
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
