import type { StrokeDrawable } from '../../types'
import { hasMinimumPoints } from '../../constants'

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * ストローク描画要素をキャンバスコンテキストにレンダリング
 * @param ctx - 描画先のキャンバスコンテキスト
 * @param stroke - レンダリングするストローク描画要素
 */
export const renderStroke = (ctx: RenderingContext, stroke: StrokeDrawable): void => {
  if (!hasMinimumPoints(stroke.points.length)) return

  const { style } = stroke

  ctx.save()

  // StrokeStyleに基づいてブレンドモードを設定
  if (style.blendMode === 'erase') {
    ctx.globalCompositeOperation = 'destination-out'
  }

  // ブラシチップから不透明度を設定
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
