import { useRef, useState, useEffect, useCallback } from 'react'
import type { Drawable, Point } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { CursorConfig, ToolType } from '@/features/tools/types'
import type { CanvasOffset } from '../hooks/useCanvasOffset'
import { DrawingCanvas } from './DrawingCanvas'
import { PointerInputLayer } from '../../pointer'
import { getPixelColor } from '../helpers'

/**
 * スポイトツール用のカーソル（SVG data URL）
 * lucide-reactのPipetteアイコンをベースに作成
 */
const EYEDROPPER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 22 1-1h3l9-9'/%3E%3Cpath d='M3 21v-3l9-9'/%3E%3Cpath d='m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z'/%3E%3C/svg%3E") 0 24, crosshair`

/**
 * Canvasコンポーネントのプロパティ
 */
type CanvasProps = {
  readonly drawables?: readonly Drawable[]
  readonly layers?: readonly Layer[]
  readonly onStartStroke: (point: Point) => void
  readonly onAddPoint: (point: Point) => void
  readonly onEndStroke: () => void
  readonly onWheel?: (deltaY: number) => void
  readonly width?: number
  readonly height?: number
  readonly fillContainer?: boolean
  readonly cursor: CursorConfig
  readonly toolType?: ToolType
  readonly offset?: CanvasOffset
  readonly onPan?: (deltaX: number, deltaY: number) => void
  /** セカンダリクリック（右クリック等）で色を取得した時のコールバック */
  readonly onPickColor?: (color: string) => void
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
  onWheel,
  width = 800,
  height = 600,
  fillContainer = false,
  cursor,
  toolType = 'pen',
  offset = { x: 0, y: 0 },
  onPan,
  onPickColor,
}: CanvasProps) => {
  const isHandTool = toolType === 'hand'
  const isEyedropperTool = toolType === 'eyedropper'
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

      // クリック位置をキャンバス座標に変換
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const color = getPixelColor(canvas, x, y)
      if (color) {
        onPickColor(color)
      }
    },
    [onPickColor]
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

  // ハンドツール時はPointerInputLayerをバイパスして直接レンダリング
  if (isHandTool) {
    return (
      <div
        ref={containerRef}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className={fillContainer ? 'w-full h-full' : 'inline-block'}
        onContextMenu={handleSecondaryClick}
      >
        <DrawingCanvas
          drawables={drawables}
          layers={layers}
          width={width}
          height={height}
          fillContainer={fillContainer}
        />
      </div>
    )
  }

  // スポイトツール時は専用UIを表示
  if (isEyedropperTool) {
    return (
      <div
        ref={containerRef}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          touchAction: 'none',
          cursor: EYEDROPPER_CURSOR,
        }}
        className={fillContainer ? 'w-full h-full' : 'inline-block'}
        onClick={handleSecondaryClick}
        onContextMenu={handleSecondaryClick}
      >
        <DrawingCanvas
          drawables={drawables}
          layers={layers}
          width={width}
          height={height}
          fillContainer={fillContainer}
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      onContextMenu={handleSecondaryClick}
    >
      <PointerInputLayer
        onStart={onStartStroke}
        onMove={onAddPoint}
        onEnd={onEndStroke}
        onWheel={onWheel}
        cursor={cursor}
        className={fillContainer ? 'w-full h-full' : 'inline-block'}
      >
        <DrawingCanvas
          drawables={drawables}
          layers={layers}
          width={width}
          height={height}
          fillContainer={fillContainer}
        />
      </PointerInputLayer>
    </div>
  )
}
