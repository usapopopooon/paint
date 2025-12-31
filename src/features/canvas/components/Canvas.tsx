import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { Drawable, Point } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { CursorConfig, ToolType } from '@/features/tools/types'
import type { CanvasOffset } from '../hooks/useCanvasOffset'
import { DrawingCanvas } from './DrawingCanvas'
import { PointerInputLayer } from '../../pointer'
import { getPixelColor, EYEDROPPER_CURSOR } from '@/features/eyedropper'

/**
 * Canvasコンポーネントのプロパティ
 */
type CanvasProps = {
  readonly drawables?: readonly Drawable[]
  readonly layers?: readonly Layer[]
  readonly onStartStroke: (point: Point) => void
  readonly onAddPoint: (point: Point) => void
  readonly onEndStroke: () => void
  readonly width?: number
  readonly height?: number
  readonly fillContainer?: boolean
  readonly cursor: CursorConfig
  readonly toolType?: ToolType
  readonly offset?: CanvasOffset
  readonly onPan?: (deltaX: number, deltaY: number) => void
  /** セカンダリクリック（右クリック等）で色を取得した時のコールバック */
  readonly onPickColor?: (color: string) => void
  /** ズーム倍率（座標変換に使用、デフォルト: 1） */
  readonly zoom?: number
  /** ビューポートサイズ（ズーム計算に使用） */
  readonly viewportSize?: { width: number; height: number }
  /** ズームツールクリック時のコールバック（ビューポートサイズ付き） */
  readonly onZoomAtPoint?: (
    mouseX: number,
    mouseY: number,
    viewportWidth: number,
    viewportHeight: number,
    direction: 'in' | 'out'
  ) => void
}

/**
 * ポインター入力と描画キャンバスを統合したコンポーネント
 * @param props - Canvasコンポーネントのプロパティ
 */
export const Canvas = ({
  drawables,
  layers,
  onStartStroke,
  onAddPoint,
  onEndStroke,
  width = 800,
  height = 600,
  fillContainer = false,
  cursor,
  toolType = 'pen',
  offset = { x: 0, y: 0 },
  onPan,
  onPickColor,
  zoom = 1,
  viewportSize = { width: 0, height: 0 },
  onZoomAtPoint,
}: CanvasProps) => {
  const isHandTool = toolType === 'hand'
  const isEyedropperTool = toolType === 'eyedropper'
  const isZoomInTool = toolType === 'zoom-in'
  const isZoomOutTool = toolType === 'zoom-out'
  const isDrawingTool = !isHandTool && !isEyedropperTool && !isZoomInTool && !isZoomOutTool
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const lastClientPosRef = useRef<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  /**
   * セカンダリクリック（右クリック等）で色を取得
   */
  const handleSecondaryClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onPickColor) return

      // コンテキストメニューを防止
      e.preventDefault()

      const container = containerRef.current
      if (!container) return

      // キャンバス要素を取得
      const canvas = container.querySelector('canvas')
      if (!canvas) return

      // クリック位置をキャンバス座標に変換（zoomを考慮）
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / zoom
      const y = (e.clientY - rect.top) / zoom

      const color = getPixelColor(canvas, x, y)
      if (color) {
        onPickColor(color)
      }
    },
    [onPickColor, zoom]
  )

  /**
   * ズームツールクリック時のハンドラ
   */
  const handleZoomClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onZoomAtPoint || (!isZoomInTool && !isZoomOutTool)) return

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const canvasCenterInViewportX = viewportSize.width / 2
      const canvasCenterInViewportY = viewportSize.height / 2
      const canvasCenterInScreenX = rect.left + rect.width / 2
      const canvasCenterInScreenY = rect.top + rect.height / 2

      const mouseX = canvasCenterInViewportX + (e.clientX - canvasCenterInScreenX)
      const mouseY = canvasCenterInViewportY + (e.clientY - canvasCenterInScreenY)

      onZoomAtPoint(
        mouseX,
        mouseY,
        viewportSize.width,
        viewportSize.height,
        isZoomInTool ? 'in' : 'out'
      )
    },
    [onZoomAtPoint, isZoomInTool, isZoomOutTool, viewportSize]
  )

  // ハンドツール時はネイティブポインターイベントでパン処理
  // clientX/clientYを使うことでtransformの影響を受けずに正確に計算できる
  useEffect(() => {
    if (!isHandTool || !onPan) return

    const container = containerRef.current
    if (!container) return

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      isDraggingRef.current = true
      lastClientPosRef.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      container.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !lastClientPosRef.current) return
      const deltaX = e.clientX - lastClientPosRef.current.x
      const deltaY = e.clientY - lastClientPosRef.current.y
      onPan(deltaX, deltaY)
      lastClientPosRef.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      lastClientPosRef.current = null
      setIsDragging(false)
      container.releasePointerCapture(e.pointerId)
    }

    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)
    container.addEventListener('pointercancel', handlePointerUp)

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
      container.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isHandTool, onPan])

  // ツールに応じたカーソルスタイルを計算
  const cursorStyle = useMemo(() => {
    if (isHandTool) {
      return isDragging ? 'grabbing' : 'grab'
    }
    if (isEyedropperTool) {
      return EYEDROPPER_CURSOR
    }
    if (isZoomInTool) {
      return 'zoom-in'
    }
    if (isZoomOutTool) {
      return 'zoom-out'
    }
    return undefined // 描画ツールはPointerInputLayerがカーソルを制御
  }, [isHandTool, isEyedropperTool, isZoomInTool, isZoomOutTool, isDragging])

  // クリックハンドラを統合
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEyedropperTool) {
        handleSecondaryClick(e)
      } else if (isZoomInTool || isZoomOutTool) {
        handleZoomClick(e)
      }
    },
    [isEyedropperTool, isZoomInTool, isZoomOutTool, handleSecondaryClick, handleZoomClick]
  )

  // 常に同じ構造を返すことでDrawingCanvasの再マウントを防ぐ
  // DrawingCanvasは常に同じ位置に配置し、PointerInputLayerはオーバーレイとして配置
  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        touchAction: 'none',
        cursor: cursorStyle,
        position: 'relative',
      }}
      className={fillContainer ? 'w-full h-full' : 'inline-block'}
      onClick={handleClick}
      onContextMenu={handleSecondaryClick}
    >
      {/* DrawingCanvasは常に同じ位置に配置 */}
      <DrawingCanvas
        drawables={drawables}
        layers={layers}
        width={width}
        height={height}
        fillContainer={fillContainer}
      />
      {/* 描画ツール時のみPointerInputLayerをオーバーレイとして表示 */}
      {isDrawingTool && (
        <PointerInputLayer
          onStart={onStartStroke}
          onMove={onAddPoint}
          onEnd={onEndStroke}
          cursor={cursor}
          className="absolute inset-0"
          zoom={zoom}
        />
      )}
    </div>
  )
}
