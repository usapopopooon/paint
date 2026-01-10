/**
 * 変形処理のコア関数
 *
 * ImageDataに依存しない純粋関数として設計。
 * Web Worker内で実行可能。
 */

/**
 * 補間方式
 */
export type InterpolationMethod = 'bilinear' | 'bicubic'

/**
 * RGBAカラー（0-255）
 */
export type RGBA = {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

/**
 * 変形パラメータ（Worker間で送受信可能）
 */
export type TransformParams = {
  readonly sourceData: Uint8ClampedArray
  readonly sourceWidth: number
  readonly sourceHeight: number
  readonly outputWidth: number
  readonly outputHeight: number
  readonly outputOffsetX: number
  readonly outputOffsetY: number
  readonly srcBoundsX: number
  readonly srcBoundsY: number
  readonly centerX: number
  readonly centerY: number
  readonly scaleX: number
  readonly scaleY: number
  readonly rotation: number
  readonly method: InterpolationMethod
}

/**
 * 変形処理の結果（Worker間で送受信可能）
 */
export type TransformCoreResult = {
  readonly data: Uint8ClampedArray
  readonly width: number
  readonly height: number
}

/**
 * 配列から指定座標のピクセル値を取得
 * 範囲外の場合は透明を返す
 */
export const getPixelFromArray = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): RGBA => {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return { r: 0, g: 0, b: 0, a: 0 }
  }
  const idx = (y * width + x) * 4
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  }
}

/**
 * 配列に指定座標のピクセル値を設定
 */
export const setPixelToArray = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  color: RGBA
): void => {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return
  }
  const idx = (y * width + x) * 4
  data[idx] = Math.round(Math.max(0, Math.min(255, color.r)))
  data[idx + 1] = Math.round(Math.max(0, Math.min(255, color.g)))
  data[idx + 2] = Math.round(Math.max(0, Math.min(255, color.b)))
  data[idx + 3] = Math.round(Math.max(0, Math.min(255, color.a)))
}

/**
 * バイリニア補間（4点の加重平均）
 */
export const bilinearInterpolateCore = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): RGBA => {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = x0 + 1
  const y1 = y0 + 1

  const dx = x - x0
  const dy = y - y0

  const p00 = getPixelFromArray(data, width, height, x0, y0)
  const p10 = getPixelFromArray(data, width, height, x1, y0)
  const p01 = getPixelFromArray(data, width, height, x0, y1)
  const p11 = getPixelFromArray(data, width, height, x1, y1)

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
    v0 * cubicKernel(t + 1) +
    v1 * cubicKernel(t) +
    v2 * cubicKernel(t - 1) +
    v3 * cubicKernel(t - 2)
  )
}

/**
 * バイキュービック補間（16点のCatmull-Romスプライン補間）
 */
export const bicubicInterpolateCore = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): RGBA => {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const dx = x - x0
  const dy = y - y0

  // 4x4グリッドのピクセルを取得
  const pixels: RGBA[][] = []
  for (let j = -1; j <= 2; j++) {
    const row: RGBA[] = []
    for (let i = -1; i <= 2; i++) {
      row.push(getPixelFromArray(data, width, height, x0 + i, y0 + j))
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
export const getInterpolatorCore = (
  method: InterpolationMethod
): ((data: Uint8ClampedArray, width: number, height: number, x: number, y: number) => RGBA) => {
  return method === 'bilinear' ? bilinearInterpolateCore : bicubicInterpolateCore
}

/**
 * 逆変換を計算する関数を生成
 * 出力座標から入力座標へのマッピング
 */
export const createInverseTransform = (
  centerX: number,
  centerY: number,
  scaleX: number,
  scaleY: number,
  rotation: number
): ((outX: number, outY: number) => { x: number; y: number }) => {
  const cosR = Math.cos(-rotation)
  const sinR = Math.sin(-rotation)
  const invScaleX = 1 / scaleX
  const invScaleY = 1 / scaleY

  return (outX: number, outY: number) => {
    const dx = outX - centerX
    const dy = outY - centerY

    // 逆回転
    const rx = dx * cosR - dy * sinR
    const ry = dx * sinR + dy * cosR

    // 逆スケール
    const sx = rx * invScaleX
    const sy = ry * invScaleY

    return {
      x: sx + centerX,
      y: sy + centerY,
    }
  }
}

/**
 * 変形処理のコア関数（Worker実行可能）
 *
 * @param params - 変形パラメータ
 * @returns 変形結果
 */
export const transformImageCore = (params: TransformParams): TransformCoreResult => {
  const {
    sourceData,
    sourceWidth,
    sourceHeight,
    outputWidth,
    outputHeight,
    outputOffsetX,
    outputOffsetY,
    srcBoundsX,
    srcBoundsY,
    centerX,
    centerY,
    scaleX,
    scaleY,
    rotation,
    method,
  } = params

  const interpolate = getInterpolatorCore(method)
  const inverseTransform = createInverseTransform(centerX, centerY, scaleX, scaleY, rotation)

  // 出力用配列を作成
  const outputData = new Uint8ClampedArray(outputWidth * outputHeight * 4)

  // 各ピクセルを処理
  for (let outY = 0; outY < outputHeight; outY++) {
    for (let outX = 0; outX < outputWidth; outX++) {
      // 出力座標を実際のキャンバス座標に変換
      const canvasX = outputOffsetX + outX
      const canvasY = outputOffsetY + outY

      // 逆変換で入力座標を取得
      const inputPoint = inverseTransform(canvasX, canvasY)

      // 入力座標をソース配列内の座標に変換
      const srcX = inputPoint.x - srcBoundsX
      const srcY = inputPoint.y - srcBoundsY

      // ソース範囲内の場合のみ補間
      if (srcX >= -0.5 && srcX < sourceWidth + 0.5 && srcY >= -0.5 && srcY < sourceHeight + 0.5) {
        const color = interpolate(sourceData, sourceWidth, sourceHeight, srcX, srcY)
        setPixelToArray(outputData, outputWidth, outputHeight, outX, outY, color)
      }
    }
  }

  return {
    data: outputData,
    width: outputWidth,
    height: outputHeight,
  }
}
