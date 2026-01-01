import { useCallback, useRef, useState, useEffect } from 'react'

/**
 * スクロールバーの方向
 */
type ScrollbarOrientation = 'horizontal' | 'vertical'

/**
 * CanvasScrollbarコンポーネントのプロパティ
 */
type CanvasScrollbarProps = {
  readonly orientation: ScrollbarOrientation
  /** ビューポートのサイズ */
  readonly viewportSize: number
  /** コンテンツ（キャンバス）のサイズ */
  readonly contentSize: number
  /** 現在のスクロール位置（オフセット） */
  readonly scrollPosition: number
  /** スクロール位置変更時のコールバック */
  readonly onScroll: (position: number) => void
}

/** スクロールバーの最小サムサイズ */
const MIN_THUMB_SIZE = 30
/** スクロールバーのトラック幅 */
const SCROLLBAR_SIZE = 12

/**
 * キャンバス用カスタムスクロールバーコンポーネント
 */
export const CanvasScrollbar = ({
  orientation,
  viewportSize,
  contentSize,
  scrollPosition,
  onScroll,
}: CanvasScrollbarProps) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ position: number; scrollPosition: number } | null>(null)

  // スクロール可能な範囲を計算
  // オフセットは負の値になるので、maxScrollはキャンバスがビューポートからはみ出る量
  const maxScroll = Math.max(0, contentSize - viewportSize)

  // サムのサイズを計算（ビューポートとコンテンツの比率）
  const thumbRatio = viewportSize / contentSize
  const thumbSize = Math.max(MIN_THUMB_SIZE, thumbRatio * viewportSize)

  // サムの位置を計算（オフセットは負の値なので反転）
  const scrollRatio = maxScroll > 0 ? -scrollPosition / maxScroll : 0
  const thumbPosition = scrollRatio * (viewportSize - thumbSize)

  // スクロールバーが必要かどうか
  const isNeeded = contentSize > viewportSize

  const handleTrackClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!trackRef.current || !isNeeded) return

      const rect = trackRef.current.getBoundingClientRect()
      const clickPosition =
        orientation === 'horizontal' ? e.clientX - rect.left : e.clientY - rect.top

      // クリック位置をスクロール位置に変換
      const trackSize = viewportSize
      const clickRatio = clickPosition / trackSize
      const newScrollPosition = -clickRatio * maxScroll

      // 範囲内に制限
      const clampedPosition = Math.max(-maxScroll, Math.min(0, newScrollPosition))
      onScroll(clampedPosition)
    },
    [orientation, viewportSize, maxScroll, onScroll, isNeeded]
  )

  const handleThumbPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      setIsDragging(true)
      dragStartRef.current = {
        position: orientation === 'horizontal' ? e.clientX : e.clientY,
        scrollPosition,
      }
    },
    [orientation, scrollPosition]
  )

  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return

      const currentPosition = orientation === 'horizontal' ? e.clientX : e.clientY
      const delta = currentPosition - dragStartRef.current.position

      // ドラッグ量をスクロール量に変換
      const trackSize = viewportSize - thumbSize
      const scrollDelta = (delta / trackSize) * maxScroll

      const newScrollPosition = dragStartRef.current.scrollPosition - scrollDelta
      const clampedPosition = Math.max(-maxScroll, Math.min(0, newScrollPosition))
      onScroll(clampedPosition)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerUp)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isDragging, orientation, viewportSize, thumbSize, maxScroll, onScroll])

  if (!isNeeded) {
    return null
  }

  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className="bg-muted/50 cursor-pointer"
      style={{
        position: 'absolute',
        ...(isHorizontal
          ? {
              bottom: 0,
              left: 0,
              right: SCROLLBAR_SIZE,
              height: SCROLLBAR_SIZE,
            }
          : {
              right: 0,
              top: 0,
              bottom: SCROLLBAR_SIZE,
              width: SCROLLBAR_SIZE,
            }),
      }}
    >
      <div
        onPointerDown={handleThumbPointerDown}
        className={`bg-muted-foreground/40 hover:bg-muted-foreground/60 transition-colors ${
          isDragging ? 'bg-muted-foreground/60' : ''
        }`}
        style={{
          position: 'absolute',
          ...(isHorizontal
            ? {
                left: thumbPosition,
                top: 2,
                bottom: 2,
                width: thumbSize,
              }
            : {
                top: thumbPosition,
                left: 2,
                right: 2,
                height: thumbSize,
              }),
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      />
    </div>
  )
}
