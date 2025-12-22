import { useCallback, useEffect, useRef, useState } from 'react'
import type { Point, Stroke } from '../types'
import { renderCanvas } from '../utils/renderer'
import { BrushCursor } from './BrushCursor'

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
  const isDrawingRef = useRef(false)
  const [size, setSize] = useState({ width, height })
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

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

  const getPoint = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    },
    []
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = true
      onStartStroke(getPoint(event))
    },
    [getPoint, onStartStroke]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getPoint(event)
      setMousePos(point)
      if (!isDrawingRef.current) return
      onAddPoint(point)
    },
    [getPoint, onAddPoint]
  )

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      setMousePos(getPoint(event))
    },
    [getPoint]
  )

  const handleMouseLeaveCanvas = useCallback(() => {
    setMousePos(null)
    if (isDrawingRef.current) {
      isDrawingRef.current = false
      onEndStroke()
    }
  }, [onEndStroke])

  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    onEndStroke()
  }, [onEndStroke])

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      isDrawingRef.current = true
      onStartStroke(getPoint(event))
    },
    [getPoint, onStartStroke]
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      if (!isDrawingRef.current) return
      onAddPoint(getPoint(event))
    },
    [getPoint, onAddPoint]
  )

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      onEndStroke()
    },
    [onEndStroke]
  )

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLCanvasElement>) => {
      if (onWheel) {
        event.preventDefault()
        onWheel(event.deltaY)
      }
    },
    [onWheel]
  )

  const cursorColor = isEraser ? '#888888' : strokeColor

  if (fillContainer) {
    return (
      <div ref={containerRef} className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeaveCanvas}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ touchAction: 'none', cursor: 'none' }}
        />
        {mousePos && (
          <BrushCursor x={mousePos.x} y={mousePos.y} size={strokeWidth} color={cursorColor} />
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeaveCanvas}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="rounded-lg border border-border"
        style={{ touchAction: 'none', cursor: 'none' }}
      />
      {mousePos && (
        <BrushCursor x={mousePos.x} y={mousePos.y} size={strokeWidth} color={cursorColor} />
      )}
    </div>
  )
}
