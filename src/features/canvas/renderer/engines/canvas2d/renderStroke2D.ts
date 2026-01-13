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
 * ストロークのバウンディングボックスを計算
 */
const getStrokeBounds = (
  stroke: StrokeDrawable
): { x: number; y: number; width: number; height: number } => {
  const { points, style } = stroke
  const halfSize = style.brushTip.size / 2

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const point of points) {
    minX = Math.min(minX, point.x - halfSize)
    minY = Math.min(minY, point.y - halfSize)
    maxX = Math.max(maxX, point.x + halfSize)
    maxY = Math.max(maxY, point.y + halfSize)
  }

  return {
    x: Math.floor(minX),
    y: Math.floor(minY),
    width: Math.ceil(maxX - minX),
    height: Math.ceil(maxY - minY),
  }
}

/**
 * ぼかしツールのレンダリング
 * ストローク領域の既存ピクセルにぼかし効果を適用
 * ImageDataを直接操作してマスクのアルファ値に基づいてピクセル単位でブレンド
 */
const renderBlurStroke = (ctx: CanvasRenderingContext2D, stroke: StrokeDrawable): void => {
  const { style } = stroke
  const brushSize = style.brushTip.size
  const opacity = style.brushTip.opacity
  const hardness = style.brushTip.hardness

  // ぼかし強度を計算
  const blurStrength = calculateBlurStrength(hardness, brushSize)
  if (blurStrength <= 0) return

  // バウンディングボックスを取得（ぼかし用のマージンを追加）
  const margin = Math.ceil(blurStrength * 2)
  const bounds = getStrokeBounds(stroke)
  const x = Math.max(0, bounds.x - margin)
  const y = Math.max(0, bounds.y - margin)
  const width = bounds.width + margin * 2
  const height = bounds.height + margin * 2

  if (width <= 0 || height <= 0) return

  // 現在の画像データを取得
  const canvas = ctx.canvas
  const safeWidth = Math.min(width, canvas.width - x)
  const safeHeight = Math.min(height, canvas.height - y)

  if (safeWidth <= 0 || safeHeight <= 0) return

  // 元の領域のImageDataを取得
  const originalImageData = ctx.getImageData(x, y, safeWidth, safeHeight)

  // ぼかした画像を作成
  const blurCanvas = document.createElement('canvas')
  blurCanvas.width = safeWidth
  blurCanvas.height = safeHeight
  const blurCtx = blurCanvas.getContext('2d')
  if (!blurCtx) return

  // 元の領域をコピーしてぼかしを適用
  blurCtx.putImageData(originalImageData, 0, 0)
  blurCtx.filter = `blur(${blurStrength}px)`
  blurCtx.globalCompositeOperation = 'copy'
  blurCtx.drawImage(blurCanvas, 0, 0)
  blurCtx.filter = 'none'
  blurCtx.globalCompositeOperation = 'source-over'

  // ぼかし画像のImageDataを取得
  const blurredImageData = blurCtx.getImageData(0, 0, safeWidth, safeHeight)

  // マスクを作成（ストローク領域）
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = safeWidth
  maskCanvas.height = safeHeight
  const maskCtx = maskCanvas.getContext('2d')
  if (!maskCtx) return

  maskCtx.translate(-x, -y)
  maskCtx.lineWidth = brushSize
  maskCtx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
  maskCtx.lineCap = 'round'
  maskCtx.lineJoin = 'round'
  drawStrokePath(maskCtx, stroke)
  maskCtx.stroke()

  // マスクのImageDataを取得
  const maskImageData = maskCtx.getImageData(0, 0, safeWidth, safeHeight)

  // ピクセル単位でブレンド
  // マスクのアルファ値に基づいて元画像とぼかし画像を線形補間
  const originalData = originalImageData.data
  const blurredData = blurredImageData.data
  const maskData = maskImageData.data

  for (let i = 0; i < originalData.length; i += 4) {
    // マスクのアルファ値を0-1の範囲に正規化
    const maskAlpha = maskData[i + 3] / 255

    if (maskAlpha > 0) {
      // 線形補間: result = original * (1 - maskAlpha) + blurred * maskAlpha
      originalData[i] = originalData[i] * (1 - maskAlpha) + blurredData[i] * maskAlpha // R
      originalData[i + 1] = originalData[i + 1] * (1 - maskAlpha) + blurredData[i + 1] * maskAlpha // G
      originalData[i + 2] = originalData[i + 2] * (1 - maskAlpha) + blurredData[i + 2] * maskAlpha // B
      originalData[i + 3] = originalData[i + 3] * (1 - maskAlpha) + blurredData[i + 3] * maskAlpha // A
    }
  }

  // 結果を元のキャンバスに描画
  ctx.putImageData(originalImageData, x, y)

  // メモリリーク防止: オフスクリーンCanvasを明示的に解放
  blurCanvas.width = 0
  blurCanvas.height = 0
  maskCanvas.width = 0
  maskCanvas.height = 0
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
  const isBlur = style.blendMode === 'blur'
  const hardness = style.brushTip.hardness

  // 消しゴムモードの場合
  if (isEraser) {
    const finalAlpha = style.brushTip.opacity
    // destination-outでは色のRGB値は無視され、アルファ値のみが使用される
    // 黒色を使用してRGB値の影響を排除
    const strokeColor = `rgba(0, 0, 0, ${finalAlpha})`

    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = style.brushTip.size
    ctx.strokeStyle = strokeColor
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    drawStrokePath(ctx, stroke)
    ctx.stroke()
    ctx.restore()
    return
  }

  // 通常のストローク描画
  const color = style.color
  const colorAlpha = hexToAlpha(style.color)
  const finalAlpha = style.brushTip.opacity * colorAlpha
  const strokeColor = hexToRgba(color, finalAlpha)

  // ぼかしモードの場合は専用のレンダリング
  if (isBlur) {
    renderBlurStroke(ctx, stroke)
    return
  }

  // 共通のストローク設定
  ctx.lineWidth = style.brushTip.size
  ctx.strokeStyle = strokeColor
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // ぼかしありの場合はshadowBlurを使用
  if (hardness > 0) {
    const blurStrength = calculateBlurStrength(hardness, style.brushTip.size)
    ctx.shadowColor = strokeColor
    ctx.shadowBlur = blurStrength
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  drawStrokePath(ctx, stroke)
  ctx.stroke()

  // シャドウをリセット
  if (hardness > 0) {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }
}
