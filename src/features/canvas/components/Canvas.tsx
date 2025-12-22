import { useMemo } from 'react'
import type { Point, Stroke } from '../types'
import { DrawingCanvas } from './DrawingCanvas'
import { PointerInputLayer } from '../../pointer'

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
  const cursor = useMemo(
    () => ({ size: strokeWidth, color: isEraser ? '#888888' : strokeColor }),
    [strokeWidth, isEraser, strokeColor]
  )

  return (
    <PointerInputLayer
      onStart={onStartStroke}
      onMove={onAddPoint}
      onEnd={onEndStroke}
      onWheel={onWheel}
      cursor={cursor}
      className={fillContainer ? 'w-full h-full' : 'inline-block'}
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
  )
}
