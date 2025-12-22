import type { Drawable, StrokeDrawable } from '../types'

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * ストローク描画要素をキャンバスコンテキストにレンダリング
 * @param ctx - 描画先のキャンバスコンテキスト
 * @param stroke - レンダリングするストローク描画要素
 */
const renderStroke = (ctx: RenderingContext, stroke: StrokeDrawable): void => {
  if (stroke.points.length < 2) return

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

/**
 * 描画要素をキャンバスコンテキストにレンダリング（タイプ別にディスパッチ）
 * @param ctx - 描画先のキャンバスコンテキスト
 * @param drawable - レンダリングする描画要素
 */
export const renderDrawable = (ctx: RenderingContext, drawable: Drawable): void => {
  switch (drawable.type) {
    case 'stroke':
      renderStroke(ctx, drawable)
      break
    // 将来の描画タイプはここで処理:
    // case 'fill': renderFill(ctx, drawable); break
    // case 'bezier': renderBezier(ctx, drawable); break
    // case 'shape': renderShape(ctx, drawable); break
    // case 'image': renderImage(ctx, drawable); break
  }
}
