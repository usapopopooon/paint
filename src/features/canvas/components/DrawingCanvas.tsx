import { useEffect, useRef, useState, forwardRef } from 'react'
import type { Stroke } from '../types'
import { renderCanvas } from '../utils/renderer'

type DrawingCanvasProps = {
  readonly strokes: readonly Stroke[]
  readonly width?: number
  readonly height?: number
  readonly backgroundColor?: string
  readonly fillContainer?: boolean
  readonly className?: string
  readonly style?: React.CSSProperties
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  (
    {
      strokes,
      width = 800,
      height = 600,
      backgroundColor = '#ffffff',
      fillContainer = false,
      className,
      style,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLCanvasElement>(null)
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef
    const containerRef = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width, height })

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
    }, [strokes, size.width, size.height, backgroundColor, canvasRef])

    if (fillContainer) {
      return (
        <div ref={containerRef} className="w-full h-full">
          <canvas
            ref={canvasRef}
            width={size.width}
            height={size.height}
            className={className}
            style={style}
          />
        </div>
      )
    }

    return (
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        className={className}
        style={style}
      />
    )
  }
)

DrawingCanvas.displayName = 'DrawingCanvas'
