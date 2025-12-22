import type { LayerRenderer } from './types'
import type { Layer, LayerBlendMode } from '../types'
import type { Drawable, StrokeDrawable } from '@/features/drawable'

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * Map LayerBlendMode to Canvas 2D globalCompositeOperation
 */
const blendModeToCompositeOp = (mode: LayerBlendMode): GlobalCompositeOperation => {
  const map: Record<LayerBlendMode, GlobalCompositeOperation> = {
    normal: 'source-over',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay',
    darken: 'darken',
    lighten: 'lighten',
  }
  return map[mode]
}

/**
 * Render a stroke drawable
 */
const renderStroke = (ctx: RenderingContext, stroke: StrokeDrawable): void => {
  if (stroke.points.length < 2) return

  const { style } = stroke

  ctx.save()

  // Set blend mode based on StrokeStyle
  if (style.blendMode === 'erase') {
    ctx.globalCompositeOperation = 'destination-out'
  }

  // Set opacity from brush tip
  ctx.globalAlpha = style.brushTip.opacity

  ctx.beginPath()
  ctx.strokeStyle = style.blendMode === 'erase' ? 'rgba(0,0,0,1)' : style.color
  ctx.lineWidth = style.brushTip.size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const [first, ...rest] = stroke.points
  ctx.moveTo(first.x, first.y)

  rest.forEach((point) => {
    ctx.lineTo(point.x, point.y)
  })

  ctx.stroke()
  ctx.restore()
}

/**
 * Render a drawable element (dispatch by type)
 */
const renderDrawable = (ctx: RenderingContext, drawable: Drawable): void => {
  switch (drawable.type) {
    case 'stroke':
      renderStroke(ctx, drawable)
      break
  }
}

/**
 * Create Canvas 2D renderer
 */
export const createCanvas2DRenderer = (): LayerRenderer => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  const render = (
    layers: readonly Layer[],
    width: number,
    height: number,
    backgroundColor: string
  ): void => {
    // Update canvas size if needed
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Render each layer
    for (const layer of layers) {
      if (!layer.visible || layer.drawables.length === 0) continue

      // Create offscreen canvas for layer
      const offscreen = new OffscreenCanvas(width, height)
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) continue

      // Draw drawables on offscreen canvas
      layer.drawables.forEach((drawable) => renderDrawable(offCtx, drawable))

      // Apply blend mode and opacity
      ctx.globalCompositeOperation = blendModeToCompositeOp(layer.blendMode)
      ctx.globalAlpha = layer.opacity
      ctx.drawImage(offscreen, 0, 0)

      // Reset composite operation and alpha
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }
  }

  const dispose = (): void => {
    // Canvas 2D doesn't need explicit cleanup
    // but interface requires this method for PixiJS compatibility
  }

  const getCanvas = (): HTMLCanvasElement => canvas

  return {
    render,
    dispose,
    getCanvas,
  }
}
