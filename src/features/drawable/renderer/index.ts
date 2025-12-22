import type { Drawable, StrokeDrawable } from '../types'

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * Render a stroke drawable to canvas context
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
 * Render a drawable element to canvas context (dispatch by type)
 */
export const renderDrawable = (ctx: RenderingContext, drawable: Drawable): void => {
  switch (drawable.type) {
    case 'stroke':
      renderStroke(ctx, drawable)
      break
    // Future drawable types will be handled here:
    // case 'fill': renderFill(ctx, drawable); break
    // case 'bezier': renderBezier(ctx, drawable); break
    // case 'shape': renderShape(ctx, drawable); break
    // case 'image': renderImage(ctx, drawable); break
  }
}
