import { Graphics } from 'pixi.js'
import type { StrokeDrawable } from '../../types'
import { hasMinimumPoints } from '../../constants'

/** ソフトエッジ消しゴムのレイヤー数 */
const SOFT_ERASER_LAYERS = 8

/**
 * ストロークのパスを描画（moveTo + lineTo）
 */
const drawStrokePath = (graphics: Graphics, stroke: StrokeDrawable): void => {
  const [first, ...rest] = stroke.points
  graphics.moveTo(first.x, first.y)
  rest.forEach((point) => {
    graphics.lineTo(point.x, point.y)
  })
}

/**
 * ソフトエッジ消しゴムをレンダリング
 * 外側から内側に向かって複数のストロークを重ねて描画し、段階的な消去効果を作る
 */
const renderSoftEraser = (graphics: Graphics, stroke: StrokeDrawable): void => {
  const { style } = stroke
  const baseSize = style.brushTip.size
  const baseOpacity = style.brushTip.opacity
  const hardness = style.brushTip.hardness

  // hardnessに基づいてソフトエッジの範囲を決定
  // hardness=1で最大のソフトエッジ、hardness=0でソフトエッジなし
  const softEdgeRatio = hardness * 0.5 // 最大でサイズの50%をソフトエッジに

  for (let i = 0; i < SOFT_ERASER_LAYERS; i++) {
    // 外側から内側へ（i=0が最外、i=SOFT_ERASER_LAYERS-1が最内）
    const progress = i / (SOFT_ERASER_LAYERS - 1) // 0 → 1

    // サイズ: 外側は大きく、内側は小さく
    const sizeMultiplier = 1 - progress * softEdgeRatio
    const layerSize = baseSize * sizeMultiplier

    // アルファ: 外側は薄く、内側は濃く（均等に分配）
    const layerAlpha = (baseOpacity / SOFT_ERASER_LAYERS) * (1 + progress * 0.5)

    graphics.setStrokeStyle({
      width: layerSize,
      color: 0xffffff,
      alpha: layerAlpha,
      cap: 'round',
      join: 'round',
    })

    drawStrokePath(graphics, stroke)
    graphics.stroke()
  }
}

/**
 * ストローク描画要素をPixiJS Graphicsにレンダリング
 * @param graphics - 描画先のPixiJS Graphics
 * @param stroke - レンダリングするストローク描画要素
 */
export const renderStroke = (graphics: Graphics, stroke: StrokeDrawable): void => {
  if (!hasMinimumPoints(stroke.points.length)) return

  const { style } = stroke
  const isEraser = style.blendMode === 'erase'

  // 消しゴム＋ぼかしありの場合はソフトエッジ消しゴムを使用
  if (isEraser && style.brushTip.hardness > 0) {
    renderSoftEraser(graphics, stroke)
    return
  }

  graphics.setStrokeStyle({
    width: style.brushTip.size,
    color: isEraser ? 0xffffff : style.color,
    alpha: style.brushTip.opacity,
    cap: 'round',
    join: 'round',
  })

  drawStrokePath(graphics, stroke)
  graphics.stroke()
}
