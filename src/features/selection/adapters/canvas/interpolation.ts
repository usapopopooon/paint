/**
 * 画像補間処理モジュール
 *
 * バイリニア補間（プレビュー用・高速）とバイキュービック補間（確定用・高品質）を提供。
 * 将来的にWeb Worker対応できるよう、純粋関数として設計。
 */

import type { Bounds, Point } from '@/lib/geometry'
import type { TransformState } from '../../types'

/**
 * 補間方式
 */
export type InterpolationMethod = 'bilinear' | 'bicubic'

/**
 * RGBAカラー
 */
export type RGBA = {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

/**
 * ImageDataから指定座標のピクセル値を取得
 * 範囲外の場合は透明を返す
 */
export const getPixel = (data: ImageData, x: number, y: number): RGBA => {
  if (x < 0 || x >= data.width || y < 0 || y >= data.height) {
    return { r: 0, g: 0, b: 0, a: 0 }
  }
  const idx = (y * data.width + x) * 4
  return {
    r: data.data[idx],
    g: data.data[idx + 1],
    b: data.data[idx + 2],
    a: data.data[idx + 3],
  }
}

/**
 * ImageDataに指定座標のピクセル値を設定
 */
export const setPixel = (data: ImageData, x: number, y: number, color: RGBA): void => {
  if (x < 0 || x >= data.width || y < 0 || y >= data.height) {
    return
  }
  const idx = (y * data.width + x) * 4
  data.data[idx] = Math.round(Math.max(0, Math.min(255, color.r)))
  data.data[idx + 1] = Math.round(Math.max(0, Math.min(255, color.g)))
  data.data[idx + 2] = Math.round(Math.max(0, Math.min(255, color.b)))
  data.data[idx + 3] = Math.round(Math.max(0, Math.min(255, color.a)))
}

/**
 * バイリニア補間（4点の加重平均）
 * プレビュー用に高速な処理を提供
 *
 * @param source - ソースImageData
 * @param x - X座標（小数可）
 * @param y - Y座標（小数可）
 * @returns 補間されたRGBA値
 */
export const bilinearInterpolate = (source: ImageData, x: number, y: number): RGBA => {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = x0 + 1
  const y1 = y0 + 1

  const dx = x - x0
  const dy = y - y0

  // 4点を取得
  const p00 = getPixel(source, x0, y0)
  const p10 = getPixel(source, x1, y0)
  const p01 = getPixel(source, x0, y1)
  const p11 = getPixel(source, x1, y1)

  // 線形補間
  const interpolate = (v00: number, v10: number, v01: number, v11: number): number => {
    const top = v00 * (1 - dx) + v10 * dx
    const bottom = v01 * (1 - dx) + v11 * dx
    return top * (1 - dy) + bottom * dy
  }

  return {
    r: interpolate(p00.r, p10.r, p01.r, p11.r),
    g: interpolate(p00.g, p10.g, p01.g, p11.g),
    b: interpolate(p00.b, p10.b, p01.b, p11.b),
    a: interpolate(p00.a, p10.a, p01.a, p11.a),
  }
}

/**
 * キュービック補間のカーネル関数（Catmull-Romスプライン）
 * @param t - 距離（-2 から 2 の範囲）
 * @returns 重み
 */
export const cubicKernel = (t: number): number => {
  const absT = Math.abs(t)
  if (absT <= 1) {
    return 1.5 * absT * absT * absT - 2.5 * absT * absT + 1
  } else if (absT <= 2) {
    return -0.5 * absT * absT * absT + 2.5 * absT * absT - 4 * absT + 2
  }
  return 0
}

/**
 * 1次元のキュービック補間
 */
const cubicInterpolate1D = (v0: number, v1: number, v2: number, v3: number, t: number): number => {
  return (
    v0 * cubicKernel(t + 1) + v1 * cubicKernel(t) + v2 * cubicKernel(t - 1) + v3 * cubicKernel(t - 2)
  )
}

/**
 * バイキュービック補間（16点のCatmull-Romスプライン補間）
 * 確定用に高品質な処理を提供
 *
 * @param source - ソースImageData
 * @param x - X座標（小数可）
 * @param y - Y座標（小数可）
 * @returns 補間されたRGBA値
 */
export const bicubicInterpolate = (source: ImageData, x: number, y: number): RGBA => {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const dx = x - x0
  const dy = y - y0

  // 4x4グリッドのピクセルを取得
  const pixels: RGBA[][] = []
  for (let j = -1; j <= 2; j++) {
    const row: RGBA[] = []
    for (let i = -1; i <= 2; i++) {
      row.push(getPixel(source, x0 + i, y0 + j))
    }
    pixels.push(row)
  }

  // 各行をX方向に補間
  const interpolateChannel = (channel: 'r' | 'g' | 'b' | 'a'): number => {
    const rowValues: number[] = []
    for (let j = 0; j < 4; j++) {
      const v0 = pixels[j][0][channel]
      const v1 = pixels[j][1][channel]
      const v2 = pixels[j][2][channel]
      const v3 = pixels[j][3][channel]
      rowValues.push(cubicInterpolate1D(v0, v1, v2, v3, dx))
    }
    // Y方向に補間
    return cubicInterpolate1D(rowValues[0], rowValues[1], rowValues[2], rowValues[3], dy)
  }

  return {
    r: Math.max(0, Math.min(255, interpolateChannel('r'))),
    g: Math.max(0, Math.min(255, interpolateChannel('g'))),
    b: Math.max(0, Math.min(255, interpolateChannel('b'))),
    a: Math.max(0, Math.min(255, interpolateChannel('a'))),
  }
}

/**
 * 補間関数を取得
 */
export const getInterpolator = (
  method: InterpolationMethod
): ((source: ImageData, x: number, y: number) => RGBA) => {
  return method === 'bilinear' ? bilinearInterpolate : bicubicInterpolate
}

/**
 * 変形の逆行列を計算
 * 出力座標から入力座標へのマッピング用
 */
export const calculateInverseTransform = (
  transform: TransformState
): ((outX: number, outY: number) => Point) => {
  const { center, scale, rotation } = transform
  const cosR = Math.cos(-rotation)
  const sinR = Math.sin(-rotation)
  const invScaleX = 1 / scale.x
  const invScaleY = 1 / scale.y

  return (outX: number, outY: number): Point => {
    // 中心からの相対座標
    const dx = outX - center.x
    const dy = outY - center.y

    // 逆スケール
    const sx = dx * invScaleX
    const sy = dy * invScaleY

    // 逆回転
    const rx = sx * cosR - sy * sinR
    const ry = sx * sinR + sy * cosR

    // 元の座標に戻す
    return {
      x: rx + center.x,
      y: ry + center.y,
    }
  }
}

/**
 * 変形後のバウンディングボックスを計算
 */
export const calculateTransformedBounds = (originalBounds: Bounds, transform: TransformState): Bounds => {
  const { center, scale, rotation } = transform
  const { x, y, width, height } = originalBounds

  // 4隅の座標
  const corners: Point[] = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]

  const cosR = Math.cos(rotation)
  const sinR = Math.sin(rotation)

  // 各隅を変形
  const transformedCorners = corners.map((corner) => {
    // 中心からの相対座標
    const dx = corner.x - center.x
    const dy = corner.y - center.y

    // スケール適用
    const sx = dx * scale.x
    const sy = dy * scale.y

    // 回転適用
    const rx = sx * cosR - sy * sinR
    const ry = sx * sinR + sy * cosR

    return {
      x: rx + center.x,
      y: ry + center.y,
    }
  })

  // バウンディングボックスを計算
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const corner of transformedCorners) {
    minX = Math.min(minX, corner.x)
    minY = Math.min(minY, corner.y)
    maxX = Math.max(maxX, corner.x)
    maxY = Math.max(maxY, corner.y)
  }

  return {
    x: Math.floor(minX),
    y: Math.floor(minY),
    width: Math.ceil(maxX - minX),
    height: Math.ceil(maxY - minY),
  }
}

/**
 * 変形をImageDataに適用
 *
 * @param source - ソースImageData
 * @param transform - 変形状態
 * @param method - 補間方式（'bilinear' or 'bicubic'）
 * @returns 変形後のImageData
 */
export const applyTransformToImageData = (
  source: ImageData,
  transform: TransformState,
  method: InterpolationMethod
): ImageData => {
  const interpolate = getInterpolator(method)
  const inverseTransform = calculateInverseTransform(transform)
  const outputBounds = calculateTransformedBounds(transform.originalBounds, transform)

  // 出力用ImageDataを作成
  const output = new ImageData(outputBounds.width, outputBounds.height)

  // 元画像のバウンズ情報
  const srcBounds = transform.originalBounds

  // 各ピクセルを処理
  for (let outY = 0; outY < outputBounds.height; outY++) {
    for (let outX = 0; outX < outputBounds.width; outX++) {
      // 出力座標を実際のキャンバス座標に変換
      const canvasX = outputBounds.x + outX
      const canvasY = outputBounds.y + outY

      // 逆変換で入力座標を取得
      const inputPoint = inverseTransform(canvasX, canvasY)

      // 入力座標をソースImageData内の座標に変換
      const srcX = inputPoint.x - srcBounds.x
      const srcY = inputPoint.y - srcBounds.y

      // ソース範囲内の場合のみ補間
      if (srcX >= -0.5 && srcX < source.width + 0.5 && srcY >= -0.5 && srcY < source.height + 0.5) {
        const color = interpolate(source, srcX, srcY)
        setPixel(output, outX, outY, color)
      }
    }
  }

  return output
}

/**
 * 単純な移動のみを適用したImageDataを取得
 * （変形なしの移動プレビュー用）
 */
export const applyOffsetToImageData = (source: ImageData, offset: Point): ImageData => {
  // オフセットが0の場合はソースをそのまま返す
  if (offset.x === 0 && offset.y === 0) {
    return source
  }

  // 新しいImageDataを作成（同じサイズ）
  const output = new ImageData(source.width, source.height)

  // 各ピクセルをコピー
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const srcIdx = (y * source.width + x) * 4
      const dstIdx = srcIdx // 同じ位置にコピー（オフセットは描画時に適用）
      output.data[dstIdx] = source.data[srcIdx]
      output.data[dstIdx + 1] = source.data[srcIdx + 1]
      output.data[dstIdx + 2] = source.data[srcIdx + 2]
      output.data[dstIdx + 3] = source.data[srcIdx + 3]
    }
  }

  return output
}
