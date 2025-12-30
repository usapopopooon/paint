import { useRef, useState, useEffect } from 'react'
import type { Drawable, Point } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { CursorConfig, ToolType } from '@/features/tools/types'
import type { CanvasOffset } from '../hooks/useCanvasOffset'
import { DrawingCanvas } from './DrawingCanvas'
import { PointerInputLayer } from '../../pointer'

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
}: CanvasProps) => {
  const isHandTool = toolType === 'hand'
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const lastClientPosRef = useRef<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
      >
        <DrawingCanvas
          drawables={drawables}
          layers={layers}
          width={width}
          height={height}
          fillContainer={fillContainer}
          className={fillContainer ? undefined : 'rounded-lg border border-border'}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
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
          className={fillContainer ? undefined : 'rounded-lg border border-border'}
        />
      </PointerInputLayer>
    </div>
  )
}
