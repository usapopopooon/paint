import { Graphics } from 'pixi.js'
import type { StrokeDrawable } from '../../types'
import { hasMinimumPoints } from '../../constants'

/**
 * ストローク描画要素をPixiJS Graphicsにレンダリング
 * @param graphics - 描画先のPixiJS Graphics
 * @param stroke - レンダリングするストローク描画要素
 */
export const renderStroke = (graphics: Graphics, stroke: StrokeDrawable): void => {
  if (!hasMinimumPoints(stroke.points.length)) return

  const { style } = stroke

  // 消しゴムの場合は黒色で描画（後でブレンドモードで消去）
  const color = style.blendMode === 'erase' ? 0x000000 : style.color

  graphics.setStrokeStyle({
    width: style.brushTip.size,
    color,
    alpha: style.brushTip.opacity,
    cap: 'round',
    join: 'round',
  })

  const [first, ...rest] = stroke.points
  graphics.moveTo(first.x, first.y)

  rest.forEach((point) => {
    graphics.lineTo(point.x, point.y)
  })

  graphics.stroke()
}
