import type { StrokeDrawable } from '@/features/drawable'
import { hasMinimumPoints, calculateBlurStrength } from '@/features/drawable'
import { hexToRgb, hexToAlpha } from '@/lib/color'

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
  const finalAlpha = style.brushTip.opacity * colorAlpha
  const strokeColor = hexToRgba(color, finalAlpha)

  // 消しゴムモードの場合はdestination-outを使用
  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out'
  }

  // 共通のストローク設定
  ctx.lineWidth = style.brushTip.size
  ctx.strokeStyle = strokeColor
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // ぼかしありの場合はshadowBlurを使用
  if (hardness > 0 && !isEraser) {
    const blurStrength = calculateBlurStrength(hardness, style.brushTip.size)
    ctx.shadowColor = strokeColor
    ctx.shadowBlur = blurStrength
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  drawStrokePath(ctx, stroke)
  ctx.stroke()

  // シャドウをリセット
  if (hardness > 0 && !isEraser) {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }

  // 消しゴムモードの後は元に戻す
  if (isEraser) {
    ctx.globalCompositeOperation = 'source-over'
  }
}
