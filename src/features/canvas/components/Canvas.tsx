import { useCallback, useState } from 'react'
import type { Point, Stroke } from '../types'
import { DrawingCanvas } from './DrawingCanvas'
import { BrushCursor } from './BrushCursor'
import { PointerInputLayer, type PointerPoint } from '../../pointer'

type CanvasProps = {
  readonly strokes: readonly Stroke[]
  readonly onStartStroke: (point: Point) => void
  readonly onAddPoint: (point: Point) => void
  readonly onEndStroke: () => void
  readonly onWheel?: (deltaY: number) => void
  readonly width?: number
  readonly height?: number
  readonly backgroundColor?: string
  readonly fillContainer?: boolean
  readonly strokeWidth?: number
  readonly strokeColor?: string
  readonly isEraser?: boolean
}

export const Canvas = ({
  strokes,
  onStartStroke,
  onAddPoint,
  onEndStroke,
  onWheel,
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  fillContainer = false,
  strokeWidth = 3,
  strokeColor = '#000000',
  isEraser = false,
}: CanvasProps) => {
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null)

  const handleStart = useCallback(
    (point: PointerPoint) => {
      onStartStroke({ x: point.x, y: point.y })
    },
    [onStartStroke]
  )

  const handleMove = useCallback(
    (point: PointerPoint) => {
      onAddPoint({ x: point.x, y: point.y })
    },
    [onAddPoint]
  )

  const cursorColor = isEraser ? '#888888' : strokeColor

  return (
    <div className={fillContainer ? 'w-full h-full relative' : 'relative inline-block'}>
      <PointerInputLayer
        onStart={handleStart}
        onMove={handleMove}
        onEnd={onEndStroke}
        onWheel={onWheel}
        onPositionChange={setPointerPosition}
        className={fillContainer ? 'w-full h-full' : undefined}
      >
        <DrawingCanvas
          strokes={strokes}
          width={width}
          height={height}
          backgroundColor={backgroundColor}
          fillContainer={fillContainer}
          className={fillContainer ? undefined : 'rounded-lg border border-border'}
        />
      </PointerInputLayer>
      {pointerPosition && (
        <BrushCursor x={pointerPosition.x} y={pointerPosition.y} size={strokeWidth} color={cursorColor} />
      )}
    </div>
  )
}
