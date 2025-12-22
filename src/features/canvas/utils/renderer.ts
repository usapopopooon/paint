import type { Stroke } from '../types'

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

const drawStroke = (ctx: RenderingContext, stroke: Stroke): void => {
  if (stroke.points.length < 2) return

  ctx.save()

  if (stroke.isEraser) {
    ctx.globalCompositeOperation = 'destination-out'
  }

  ctx.beginPath()
  ctx.strokeStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color
  ctx.lineWidth = stroke.width
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

export const renderCanvas = (
  ctx: CanvasRenderingContext2D,
  strokes: readonly Stroke[],
  width: number,
  height: number,
  backgroundColor: string
): void => {
  // Clear the main canvas and fill with background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Create offscreen canvas for strokes (so eraser doesn't erase background)
  const offscreen = new OffscreenCanvas(width, height)
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return

  // Draw all strokes on offscreen canvas (transparent background)
  offCtx.clearRect(0, 0, width, height)
  strokes.forEach((stroke) => drawStroke(offCtx, stroke))

  // Composite the strokes onto the main canvas
  ctx.drawImage(offscreen, 0, 0)
}
