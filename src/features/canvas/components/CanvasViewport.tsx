import { useRef, useState, useEffect, useCallback } from 'react'
import type { CanvasOffset } from '../hooks/useCanvasOffset'
import { CanvasScrollbar } from './CanvasScrollbar'

/**
 * CanvasViewportコンポーネントのプロパティ
 */
type CanvasViewportProps = {
  /** キャンバスの幅 */
  readonly canvasWidth: number
  /** キャンバスの高さ */
  readonly canvasHeight: number
  /** 現在のオフセット */
  readonly offset: CanvasOffset
  /** オフセット変更時のコールバック */
  readonly onOffsetChange: (x: number, y: number) => void
  /** ズーム倍率（デフォルト: 1） */
  readonly zoom?: number
  /** ホイールイベントのコールバック（マウス位置とビューポートサイズ付き） */
  readonly onWheelAtPoint?: (
    deltaY: number,
    mouseX: number,
    mouseY: number,
    viewportWidth: number,
    viewportHeight: number
  ) => { direction: 'in' | 'out' }
  /** 子要素（Canvas）- render propでviewportSizeを渡す */
  readonly children:
    | React.ReactNode
    | ((viewportSize: { width: number; height: number }) => React.ReactNode)
}

/**
 * キャンバスビューポートコンポーネント
 * スクロールバーを含むキャンバス表示領域を管理する
 */
export const CanvasViewport = ({
  canvasWidth,
  canvasHeight,
  offset,
  onOffsetChange,
  zoom = 1,
  onWheelAtPoint,
  children,
}: CanvasViewportProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [zoomCursor, setZoomCursor] = useState<'zoom-in' | 'zoom-out' | null>(null)
  const zoomCursorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ビューポートサイズの監視
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  // ホイールイベントリスナー（passive: falseでpreventDefaultを有効化）
  useEffect(() => {
    const container = containerRef.current
    if (!container || !onWheelAtPoint) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()

      const rect = container.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const result = onWheelAtPoint(
        event.deltaY,
        mouseX,
        mouseY,
        viewportSize.width,
        viewportSize.height
      )

      // カーソルをズームアイコンに変更
      setZoomCursor(result.direction === 'in' ? 'zoom-in' : 'zoom-out')

      // 既存のタイムアウトをクリア
      if (zoomCursorTimeoutRef.current) {
        clearTimeout(zoomCursorTimeoutRef.current)
      }

      // 一定時間後にカーソルをリセット
      zoomCursorTimeoutRef.current = setTimeout(() => {
        setZoomCursor(null)
      }, 150)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
      if (zoomCursorTimeoutRef.current) {
        clearTimeout(zoomCursorTimeoutRef.current)
      }
    }
  }, [onWheelAtPoint, viewportSize.width, viewportSize.height])

  // 水平スクロール処理
  const handleHorizontalScroll = useCallback(
    (position: number) => {
      onOffsetChange(position, offset.y)
    },
    [offset.y, onOffsetChange]
  )

  // 垂直スクロール処理
  const handleVerticalScroll = useCallback(
    (position: number) => {
      onOffsetChange(offset.x, position)
    },
    [offset.x, onOffsetChange]
  )

  // ズーム適用後のキャンバスサイズ
  const scaledWidth = canvasWidth * zoom
  const scaledHeight = canvasHeight * zoom

  // スクロールバーが必要かどうか
  const needsHorizontalScroll = scaledWidth > viewportSize.width
  const needsVerticalScroll = scaledHeight > viewportSize.height

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={zoomCursor ? { cursor: zoomCursor } : undefined}
    >
      {/* キャンバス表示領域 */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {typeof children === 'function' ? children(viewportSize) : children}
      </div>

      {/* 水平スクロールバー */}
      {needsHorizontalScroll && (
        <CanvasScrollbar
          orientation="horizontal"
          viewportSize={viewportSize.width}
          contentSize={scaledWidth}
          scrollPosition={offset.x}
          onScroll={handleHorizontalScroll}
        />
      )}

      {/* 垂直スクロールバー */}
      {needsVerticalScroll && (
        <CanvasScrollbar
          orientation="vertical"
          viewportSize={viewportSize.height}
          contentSize={scaledHeight}
          scrollPosition={offset.y}
          onScroll={handleVerticalScroll}
        />
      )}
    </div>
  )
}
