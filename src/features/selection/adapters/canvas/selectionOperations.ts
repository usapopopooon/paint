import type { Point, Bounds } from '@/lib/geometry'
import type { Layer } from '@/features/layer'
import type { Drawable } from '@/features/drawable'
import type { SelectionShape } from '../../types'

/**
 * 選択領域からImageDataを取得
 * @param ctx - ソースとなるCanvasコンテキスト
 * @param shape - 選択領域の形状
 * @param offset - 選択領域のオフセット
 * @returns 選択領域のImageData
 */
export const getImageDataFromSelection = (
  ctx: CanvasRenderingContext2D,
  shape: SelectionShape,
  offset: Point = { x: 0, y: 0 }
): ImageData => {
  const bounds = getSelectionBounds(shape, offset)
  return ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height)
}

/**
 * 選択領域のバウンディングボックスを取得
 * @param shape - 選択領域の形状
 * @param offset - オフセット
 * @returns バウンディングボックス
 */
export const getSelectionBounds = (
  shape: SelectionShape,
  offset: Point = { x: 0, y: 0 }
): Bounds => {
  if (shape.type === 'rectangle') {
    return {
      x: Math.floor(shape.bounds.x + offset.x),
      y: Math.floor(shape.bounds.y + offset.y),
      width: Math.ceil(shape.bounds.width),
      height: Math.ceil(shape.bounds.height),
    }
  }

  // Lasso: ポイントからバウンディングボックスを計算
  const points = shape.points
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const point of points) {
    minX = Math.min(minX, point.x + offset.x)
    minY = Math.min(minY, point.y + offset.y)
    maxX = Math.max(maxX, point.x + offset.x)
    maxY = Math.max(maxY, point.y + offset.y)
  }

  return {
    x: Math.floor(minX),
    y: Math.floor(minY),
    width: Math.ceil(maxX - minX),
    height: Math.ceil(maxY - minY),
  }
}

/**
 * 選択領域をクリア（透明にする）
 * @param ctx - 操作対象のCanvasコンテキスト
 * @param shape - 選択領域の形状
 * @param offset - 選択領域のオフセット
 */
export const clearSelectionRegion = (
  ctx: CanvasRenderingContext2D,
  shape: SelectionShape,
  offset: Point = { x: 0, y: 0 }
): void => {
  ctx.save()

  // 選択領域のクリッピングパスを作成
  createSelectionClipPath(ctx, shape, offset)
  ctx.clip()

  // クリッピング領域内をクリア
  const bounds = getSelectionBounds(shape, offset)
  ctx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height)

  ctx.restore()
}

/**
 * 選択領域のクリッピングパスを作成
 * @param ctx - Canvasコンテキスト
 * @param shape - 選択領域の形状
 * @param offset - オフセット
 */
const createSelectionClipPath = (
  ctx: CanvasRenderingContext2D,
  shape: SelectionShape,
  offset: Point
): void => {
  ctx.beginPath()

  if (shape.type === 'rectangle') {
    const { bounds } = shape
    ctx.rect(bounds.x + offset.x, bounds.y + offset.y, bounds.width, bounds.height)
  } else {
    const { points } = shape
    if (points.length < 3) return

    ctx.moveTo(points[0].x + offset.x, points[0].y + offset.y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x + offset.x, points[i].y + offset.y)
    }
    ctx.closePath()
  }
}

/**
 * ImageDataを指定位置に描画
 * @param ctx - 描画先のCanvasコンテキスト
 * @param imageData - 描画するImageData
 * @param x - X座標
 * @param y - Y座標
 */
export const putImageDataAt = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  x: number,
  y: number
): void => {
  ctx.putImageData(imageData, x, y)
}

/**
 * 選択領域を色で塗りつぶし
 * @param ctx - 操作対象のCanvasコンテキスト
 * @param shape - 選択領域の形状
 * @param color - 塗りつぶし色
 * @param offset - 選択領域のオフセット
 */
export const fillSelectionRegion = (
  ctx: CanvasRenderingContext2D,
  shape: SelectionShape,
  color: string,
  offset: Point = { x: 0, y: 0 }
): void => {
  ctx.save()

  // 選択領域のクリッピングパスを作成
  createSelectionClipPath(ctx, shape, offset)

  ctx.fillStyle = color
  ctx.fill()

  ctx.restore()
}

/**
 * Lasso選択用: 選択領域外を透明化したImageDataを取得（同期版）
 * （矩形以外の選択では、バウンディングボックス内でも選択外のピクセルは透明にする必要がある）
 * @param ctx - ソースとなるCanvasコンテキスト
 * @param shape - 選択領域の形状
 * @param offset - 選択領域のオフセット
 * @returns マスク適用済みのImageData
 * @deprecated 大きな選択領域ではgetMaskedImageDataFromSelectionAsyncを使用してください
 */
export const getMaskedImageDataFromSelection = (
  ctx: CanvasRenderingContext2D,
  shape: SelectionShape,
  offset: Point = { x: 0, y: 0 }
): ImageData => {
  const bounds = getSelectionBounds(shape, offset)
  const imageData = ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height)

  // 矩形選択の場合はマスク不要
  if (shape.type === 'rectangle') {
    return imageData
  }

  // Lasso選択: 選択領域外のピクセルを透明にする
  const { points } = shape
  const data = imageData.data

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const canvasX = bounds.x + x
      const canvasY = bounds.y + y

      // 点がLasso内にあるかチェック（Ray casting algorithm）
      if (!isPointInPolygon({ x: canvasX - offset.x, y: canvasY - offset.y }, points)) {
        // 選択外のピクセルを透明に
        const idx = (y * imageData.width + x) * 4
        data[idx + 3] = 0 // アルファを0に
      }
    }
  }

  return imageData
}

/**
 * Lasso選択用: 選択領域外を透明化したImageDataを取得（非同期版、Web Worker使用）
 * （矩形以外の選択では、バウンディングボックス内でも選択外のピクセルは透明にする必要がある）
 * @param ctx - ソースとなるCanvasコンテキスト
 * @param shape - 選択領域の形状
 * @param offset - 選択領域のオフセット
 * @returns マスク適用済みのImageData
 */
export const getMaskedImageDataFromSelectionAsync = async (
  ctx: CanvasRenderingContext2D,
  shape: SelectionShape,
  offset: Point = { x: 0, y: 0 }
): Promise<ImageData> => {
  const bounds = getSelectionBounds(shape, offset)
  const imageData = ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height)

  // 矩形選択の場合はマスク不要
  if (shape.type === 'rectangle') {
    return imageData
  }

  // Lasso選択: Web Workerでマスク処理
  const { applyLassoMask } = await import('./selectionWorker')

  return applyLassoMask({
    sourceImageData: imageData,
    boundsX: bounds.x,
    boundsY: bounds.y,
    offset,
    points: shape.points,
  })
}

/**
 * 点がポリゴン内にあるかを判定（Ray casting algorithm）
 * @param point - 判定する点
 * @param polygon - ポリゴンの頂点配列
 * @returns 内部にあればtrue
 */
const isPointInPolygon = (point: Point, polygon: readonly Point[]): boolean => {
  if (polygon.length < 3) return false

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * ImageDataをbase64データURLに変換
 * @param imageData - 変換するImageData
 * @returns base64データURL
 */
export const imageDataToDataURL = (imageData: ImageData): string => {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * レイヤーのdrawablesを一時Canvasにレンダリングして返す
 * @param layer - レンダリングするレイヤー
 * @param width - キャンバス幅
 * @param height - キャンバス高さ
 * @returns 一時Canvas
 */
export const renderLayerToOffscreenCanvas = async (
  layer: Layer,
  width: number,
  height: number
): Promise<HTMLCanvasElement> => {
  // 遅延インポートで循環依存を回避
  const { isStrokeDrawable, isImageDrawable, isEraserStroke, getHardness } =
    await import('@/features/drawable')

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  for (const drawable of layer.drawables) {
    await renderDrawableToContext(ctx, drawable, {
      isStrokeDrawable,
      isImageDrawable,
      isEraserStroke,
      getHardness,
    })
  }

  return canvas
}

/**
 * drawableをコンテキストにレンダリング（内部ヘルパー）
 */
const renderDrawableToContext = async (
  ctx: CanvasRenderingContext2D,
  drawable: Drawable,
  helpers: {
    isStrokeDrawable: (d: Drawable) => boolean
    isImageDrawable: (d: Drawable) => boolean
    isEraserStroke: (d: Drawable) => boolean
    getHardness: (d: Drawable) => number
  }
): Promise<void> => {
  if (helpers.isImageDrawable(drawable)) {
    // 画像描画
    const imgDrawable = drawable as {
      src: string
      x: number
      y: number
      width: number
      height: number
      scaleX: number
    }
    const img = await loadImageElement(imgDrawable.src)
    ctx.save()
    if (imgDrawable.scaleX < 0) {
      ctx.translate(imgDrawable.x + imgDrawable.width, imgDrawable.y)
      ctx.scale(-1, 1)
      ctx.drawImage(img, 0, 0, imgDrawable.width, imgDrawable.height)
    } else {
      ctx.drawImage(img, imgDrawable.x, imgDrawable.y, imgDrawable.width, imgDrawable.height)
    }
    ctx.restore()
  } else if (helpers.isStrokeDrawable(drawable)) {
    // ストローク描画
    const strokeDrawable = drawable as unknown as {
      points: readonly Point[]
      style: {
        color: string
        brushTip: { type: string; size: number; hardness?: number; isBlurEnabled?: boolean }
        alpha: number
      }
    }

    if (helpers.isEraserStroke(drawable)) {
      ctx.globalCompositeOperation = 'destination-out'
    }

    const { points, style } = strokeDrawable
    if (points.length === 0) return

    ctx.save()
    ctx.strokeStyle = style.color
    ctx.lineWidth = style.brushTip.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = style.alpha

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
    ctx.restore()

    if (helpers.isEraserStroke(drawable)) {
      ctx.globalCompositeOperation = 'source-over'
    }
  }
}

/**
 * 画像要素を読み込む
 */
const loadImageElement = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Canvasの内容全体をbase64データURLとして取得
 */
export const canvasToDataURL = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png')
}

/**
 * 空のオフスクリーンCanvasを作成
 * @param width - キャンバス幅
 * @param height - キャンバス高さ
 * @returns 空のCanvas
 */
export const createEmptyCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * レイヤーまたは空のオフスクリーンCanvasを取得
 * drawablesが空の場合は新しい空のキャンバスを返す
 * @param layer - レイヤー
 * @param width - キャンバス幅
 * @param height - キャンバス高さ
 * @returns オフスクリーンCanvas
 */
export const getOrCreateOffscreenCanvas = async (
  layer: Layer,
  width: number,
  height: number
): Promise<HTMLCanvasElement> => {
  if (layer.drawables.length > 0) {
    return renderLayerToOffscreenCanvas(layer, width, height)
  }
  return createEmptyCanvas(width, height)
}

/**
 * ImageDataを一時Canvasに描画
 * @param imageData - 描画するImageData
 * @returns 一時Canvas
 */
export const imageDataToCanvas = (imageData: ImageData): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/**
 * ImageDataを指定位置にキャンバスに描画（高品質・ボケ防止）
 * @param ctx - 描画先のコンテキスト
 * @param imageData - 描画するImageData
 * @param x - X座標
 * @param y - Y座標
 */
export const drawImageDataToContext = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  x: number,
  y: number
): void => {
  ctx.imageSmoothingEnabled = false
  const tempCanvas = imageDataToCanvas(imageData)
  ctx.drawImage(tempCanvas, Math.round(x), Math.round(y))
}
