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
  const isEraser = style.blendMode === 'erase'

  // 消しゴムの場合：アルファ値が消去量になる（1.0で完全消去、0.5で半分消去など）
  // 将来的にぼかし消去にも対応可能
  graphics.setStrokeStyle({
    width: style.brushTip.size,
    color: isEraser ? 0xffffff : style.color,
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
