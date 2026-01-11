import { TRANSPARENT_THRESHOLD } from '../constants'

/**
 * Canvas2D用ImageDataキャッシュ
 * キャンバスごとにImageDataをキャッシュし、連続した色取得を高速化
 */
type ImageDataCache = {
  imageData: ImageData
  width: number
  height: number
}

/** キャンバスをキーにしたImageDataキャッシュ */
const imageDataCache = new WeakMap<HTMLCanvasElement, ImageDataCache>()

/**
 * キャッシュを無効化
 * キャンバスの内容が変更された後に呼び出す
 * @param canvas - キャッシュを無効化するキャンバス
 */
export const invalidatePixelColorCache = (canvas: HTMLCanvasElement): void => {
  imageDataCache.delete(canvas)
}

/**
 * Canvas2DからImageDataを取得（キャッシュ付き）
 */
const getCachedImageData = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): ImageData => {
  const cached = imageDataCache.get(canvas)

  // キャッシュが有効かつサイズが一致する場合はキャッシュを返す
  if (cached && cached.width === canvas.width && cached.height === canvas.height) {
    return cached.imageData
  }

  // 新しいImageDataを取得してキャッシュ
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  imageDataCache.set(canvas, {
    imageData,
    width: canvas.width,
    height: canvas.height,
  })

  return imageData
}

/**
 * キャンバス上の指定位置からピクセルカラーを取得
 * WebGLキャンバス（PixiJS）とCanvas2Dの両方に対応
 * Canvas2Dの場合はImageDataをキャッシュして連続取得を高速化
 * @param canvas - HTMLCanvasElement
 * @param x - X座標
 * @param y - Y座標
 * @returns HEX形式の色文字列 (例: #ff0000)、透明または取得できない場合はnull
 */
export const getPixelColor = (canvas: HTMLCanvasElement, x: number, y: number): string | null => {
  const floorX = Math.floor(x)
  const floorY = Math.floor(y)

  // 範囲外チェック
  if (floorX < 0 || floorX >= canvas.width || floorY < 0 || floorY >= canvas.height) {
    return null
  }

  // WebGLコンテキストを試す
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (gl) {
    const pixel = new Uint8Array(4)
    // WebGLはY軸が反転しているので調整
    gl.readPixels(floorX, canvas.height - floorY - 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)

    // 透明なピクセルはnullを返す
    if (pixel[3] < TRANSPARENT_THRESHOLD) {
      return null
    }

    const r = pixel[0].toString(16).padStart(2, '0')
    const g = pixel[1].toString(16).padStart(2, '0')
    const b = pixel[2].toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }

  // 2Dコンテキストにフォールバック
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  // キャッシュされたImageDataを使用
  const imageData = getCachedImageData(ctx, canvas)
  const index = (floorY * canvas.width + floorX) * 4

  const r = imageData.data[index]
  const g = imageData.data[index + 1]
  const b = imageData.data[index + 2]
  const a = imageData.data[index + 3]

  // 透明なピクセルはnullを返す
  if (a < TRANSPARENT_THRESHOLD) {
    return null
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
