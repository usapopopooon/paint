import { useCallback, useEffect, useRef, useState } from 'react'
import type { Point, Stroke } from '../types'
import { renderCanvas } from '../utils/renderer'
import { BrushCursor } from './BrushCursor'
import { usePointerInput, type PointerPoint } from '../../pointer'

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width, height })

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

  const { pointerProps, pointerPosition } = usePointerInput({
    onStart: handleStart,
    onMove: handleMove,
    onEnd: onEndStroke,
    onWheel,
  })

  // Handle resize when fillContainer is true
  useEffect(() => {
    if (!fillContainer) {
      setSize({ width, height })
      return
    }

    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [fillContainer, width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    renderCanvas(ctx, strokes, size.width, size.height, backgroundColor)
  }, [strokes, size.width, size.height, backgroundColor])

  const cursorColor = isEraser ? '#888888' : strokeColor

  if (fillContainer) {
    return (
      <div ref={containerRef} className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          {...pointerProps}
          style={{ touchAction: 'none', cursor: 'none' }}
        />
        {pointerPosition && (
          <BrushCursor x={pointerPosition.x} y={pointerPosition.y} size={strokeWidth} color={cursorColor} />
        )}
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        {...pointerProps}
        className="rounded-lg border border-border"
        style={{ touchAction: 'none', cursor: 'none' }}
      />
      {pointerPosition && (
        <BrushCursor x={pointerPosition.x} y={pointerPosition.y} size={strokeWidth} color={cursorColor} />
      )}
    </div>
  )
}
