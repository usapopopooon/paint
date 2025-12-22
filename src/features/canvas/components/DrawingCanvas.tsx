import { useEffect, useRef, useState } from 'react'
import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { renderDrawables, renderLayers } from '../utils/renderer'

type DrawingCanvasProps = {
  readonly drawables?: readonly Drawable[]
  readonly layers?: readonly Layer[]
  readonly width?: number
  readonly height?: number
  readonly backgroundColor?: string
  readonly fillContainer?: boolean
  readonly className?: string
}

export const DrawingCanvas = ({
  drawables,
  layers,
  width = 800,
  height = 600,
  backgroundColor = '#ffffff',
  fillContainer = false,
  className,
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

    // Use layers if provided, otherwise fall back to drawables
    if (layers) {
      renderLayers(ctx, layers, size.width, size.height, backgroundColor)
    } else if (drawables) {
      renderDrawables(ctx, drawables, size.width, size.height, backgroundColor)
    } else {
      // No content, just fill with background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, size.width, size.height)
    }
  }, [drawables, layers, size.width, size.height, backgroundColor])

  if (fillContainer) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <canvas ref={canvasRef} width={size.width} height={size.height} className={className} />
      </div>
    )
  }

  return <canvas ref={canvasRef} width={size.width} height={size.height} className={className} />
}
