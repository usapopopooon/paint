import { useCallback, useEffect, useRef, useState } from 'react'
import type { Point, Stroke } from '../types'
import { renderCanvas } from '../utils/renderer'

type CanvasProps = {
  readonly strokes: readonly Stroke[]
  readonly onStartStroke: (point: Point) => void
  readonly onAddPoint: (point: Point) => void
  readonly onEndStroke: () => void
  readonly width?: number
  readonly height?: number
  readonly backgroundColor?: string
  readonly fillContainer?: boolean
}

export const Canvas = ({
  strokes,
  onStartStroke,
  onAddPoint,
  onEndStroke,
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  fillContainer = false,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDrawingRef = useRef(false)
  const [size, setSize] = useState({ width, height })

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
      if (!isDrawingRef.current) return
      onAddPoint(getPoint(event))
    },
    [getPoint, onAddPoint]
  )

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

  if (fillContainer) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      width={size.width}
      height={size.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="cursor-crosshair rounded-lg border border-border"
      style={{ touchAction: 'none' }}
    />
  )
}
