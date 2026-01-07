import { memo, useState, useCallback, useEffect, useRef } from 'react'
import { MIN_ZOOM, MAX_ZOOM } from '@/features/canvas'

/** ホイールスクロール1回あたりのズーム変化量（UI表示パーセント） */
const WHEEL_STEP = 10

type ZoomDisplayProps = {
  readonly zoomPercent: number
  readonly onZoomChange: (zoom: number) => void
}

export const ZoomDisplay = memo(function ZoomDisplay({
  zoomPercent,
  onZoomChange,
}: ZoomDisplayProps) {
  const [inputValue, setInputValue] = useState(String(zoomPercent))
  const inputRef = useRef<HTMLInputElement>(null)

  // 外部からのzoomPercent変更に追従
  useEffect(() => {
    setInputValue(String(zoomPercent))
  }, [zoomPercent])

  // ホイールイベントハンドラ（passive: false で登録）
  useEffect(() => {
    const element = inputRef.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP
      const newPercent = zoomPercent + delta
      const zoom = newPercent / 100
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
      onZoomChange(clampedZoom)
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [zoomPercent, onZoomChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleBlur = useCallback(() => {
    const value = parseInt(inputValue, 10)
    if (!isNaN(value)) {
      const zoom = value / 100
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
      onZoomChange(clampedZoom)
      setInputValue(String(Math.round(clampedZoom * 100)))
    } else {
      setInputValue(String(zoomPercent))
    }
  }, [inputValue, zoomPercent, onZoomChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur()
      } else if (e.key === 'Escape') {
        setInputValue(String(zoomPercent))
        e.currentTarget.blur()
      }
    },
    [zoomPercent]
  )

  // UI表示用の最小・最大パーセント
  const minPercent = Math.round(MIN_ZOOM * 100)
  const maxPercent = Math.round(MAX_ZOOM * 100)

  return (
    <div className="flex items-center">
      <input
        ref={inputRef}
        type="number"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={minPercent}
        max={maxPercent}
        step={WHEEL_STEP}
        className="w-14 h-7 text-xs text-center px-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
      />
      <span className="text-xs text-zinc-600 dark:text-zinc-400 ml-1">%</span>
    </div>
  )
})
