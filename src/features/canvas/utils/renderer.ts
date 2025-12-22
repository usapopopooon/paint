import type { Stroke } from '../types'

const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke): void => {
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
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)
  strokes.forEach((stroke) => drawStroke(ctx, stroke))
}
