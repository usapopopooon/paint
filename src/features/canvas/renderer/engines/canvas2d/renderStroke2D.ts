import type { StrokeDrawable } from '@/features/drawable'
import { hasMinimumPoints } from '@/features/drawable/constants'
import { hexToRgb, hexToAlpha } from '@/lib/color'

/** ソフトエッジのレイヤー数 */
const SOFT_EDGE_LAYERS = 8

/**
 * HEXカラーとアルファ値からCSSのrgba文字列を生成
 */
const hexToRgba = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex).slice(1)
  const r = parseInt(rgb.slice(0, 2), 16)
  const g = parseInt(rgb.slice(2, 4), 16)
  const b = parseInt(rgb.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * ストロークのパスを描画（moveTo + lineTo）
 */
const drawStrokePath = (ctx: CanvasRenderingContext2D, stroke: StrokeDrawable): void => {
  const [first, ...rest] = stroke.points
  ctx.beginPath()
  ctx.moveTo(first.x, first.y)
  rest.forEach((point) => {
    ctx.lineTo(point.x, point.y)
  })
}

/**
 * ソフトエッジストロークをレンダリング
 * 外側から内側に向かって複数のストロークを重ねて描画し、ぼかし効果を作る
 */
const renderSoftEdge = (
  ctx: CanvasRenderingContext2D,
  stroke: StrokeDrawable,
  color: string,
  colorAlpha: number
): void => {
  const { style } = stroke
  const baseSize = style.brushTip.size
  const baseOpacity = style.brushTip.opacity * colorAlpha
  const hardness = style.brushTip.hardness

  // hardnessが高いほどソフトエッジが大きくなる（hardness=0でなし、hardness=1で最大）
  const softEdgeRatio = hardness * 0.5 // 最大でサイズの50%をソフトエッジに

  for (let i = 0; i < SOFT_EDGE_LAYERS; i++) {
    // 外側から内側へ（i=0が最外、i=SOFT_EDGE_LAYERS-1が最内）
    const progress = i / (SOFT_EDGE_LAYERS - 1) // 0 → 1

    // サイズ: 外側は大きく、内側は小さく
    const sizeMultiplier = 1 - progress * softEdgeRatio
    const layerSize = baseSize * sizeMultiplier

    // アルファ: 外側は薄く、内側は濃く（均等に分配）
    const layerAlpha = (baseOpacity / SOFT_EDGE_LAYERS) * (1 + progress * 0.5)

    ctx.lineWidth = layerSize
    ctx.strokeStyle = hexToRgba(color, layerAlpha)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    drawStrokePath(ctx, stroke)
    ctx.stroke()
  }
}

/**
 * ストローク描画要素をCanvas 2Dにレンダリング
 * @param ctx - Canvas 2D コンテキスト
 * @param stroke - レンダリングするストローク描画要素
 */
export const renderStroke2D = (ctx: CanvasRenderingContext2D, stroke: StrokeDrawable): void => {
  if (!hasMinimumPoints(stroke.points.length)) return

  const { style } = stroke
  const isEraser = style.blendMode === 'erase'
  const hardness = style.brushTip.hardness
  const color = isEraser ? '#ffffff' : style.color
  const colorAlpha = isEraser ? 1 : hexToAlpha(style.color)

  // 消しゴムモードの場合はdestination-outを使用
  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out'
  }

  // ぼかしありの場合はソフトエッジレンダリング
  if (hardness > 0) {
    renderSoftEdge(ctx, stroke, color, colorAlpha)
    // 消しゴムモードの後は元に戻す
    if (isEraser) {
      ctx.globalCompositeOperation = 'source-over'
    }
    return
  }

  // ぼかしなしの場合は通常レンダリング
  ctx.lineWidth = style.brushTip.size
  ctx.strokeStyle = hexToRgba(color, style.brushTip.opacity * colorAlpha)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  drawStrokePath(ctx, stroke)
  ctx.stroke()

  // 消しゴムモードの後は元に戻す
  if (isEraser) {
    ctx.globalCompositeOperation = 'source-over'
  }
}
