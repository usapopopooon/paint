import type { Drawable, StrokeDrawable } from '@/features/drawable'
import type { Layer, LayerBlendMode } from '@/features/layer'

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * Map LayerBlendMode to Canvas 2D globalCompositeOperation
 */
const layerBlendModeToCompositeOp = (mode: LayerBlendMode): GlobalCompositeOperation => {
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

  // Future: Apply blur/softness based on style.brushTip.type and hardness

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
export const renderDrawable = (ctx: RenderingContext, drawable: Drawable): void => {
  switch (drawable.type) {
    case 'stroke':
      renderStroke(ctx, drawable)
      break
    // Future drawable types will be handled here
    // case 'fill':
    //   renderFill(ctx, drawable)
    //   break
    // case 'bezier':
    //   renderBezier(ctx, drawable)
    //   break
    // case 'shape':
    //   renderShape(ctx, drawable)
    //   break
    // case 'image':
    //   renderImage(ctx, drawable)
    //   break
  }
}

/**
 * Render drawables to canvas
 */
export const renderDrawables = (
  ctx: CanvasRenderingContext2D,
  drawables: readonly Drawable[],
  width: number,
  height: number,
  backgroundColor: string
): void => {
  // Clear the main canvas and fill with background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Create offscreen canvas for drawables (so eraser doesn't erase background)
  const offscreen = new OffscreenCanvas(width, height)
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return

  // Draw all drawables on offscreen canvas (transparent background)
  offCtx.clearRect(0, 0, width, height)
  drawables.forEach((drawable) => renderDrawable(offCtx, drawable))

  // Composite the drawables onto the main canvas
  ctx.drawImage(offscreen, 0, 0)
}

/**
 * Render layers to canvas
 * Each layer is rendered with its own blend mode and opacity
 */
export const renderLayers = (
  ctx: CanvasRenderingContext2D,
  layers: readonly Layer[],
  width: number,
  height: number,
  backgroundColor: string
): void => {
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
    ctx.globalCompositeOperation = layerBlendModeToCompositeOp(layer.blendMode)
    ctx.globalAlpha = layer.opacity
    ctx.drawImage(offscreen, 0, 0)

    // Reset composite operation and alpha
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
}
