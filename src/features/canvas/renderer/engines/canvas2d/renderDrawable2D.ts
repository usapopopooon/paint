import type { Drawable, ImageDrawable } from '@/features/drawable'
import { isImageDrawable, isStrokeDrawable } from '@/features/drawable'
import { renderStroke2D } from './renderStroke2D'

// 画像キャッシュ
const imageCache = new Map<string, HTMLImageElement>()

/**
 * 画像を読み込んでキャッシュ
 */
const loadImage = async (src: string): Promise<HTMLImageElement> => {
  const cached = imageCache.get(src)
  if (cached) return cached

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

/**
 * 画像描画要素をCanvas 2Dにレンダリング
 */
const renderImage2D = async (
  ctx: CanvasRenderingContext2D,
  drawable: ImageDrawable
): Promise<void> => {
  const img = await loadImage(drawable.src)

  ctx.save()

  // scaleXが負の場合（反転時）
  if (drawable.scaleX < 0) {
    ctx.translate(drawable.x + drawable.width, drawable.y)
    ctx.scale(-1, 1)
    ctx.drawImage(img, 0, 0, drawable.width, drawable.height)
  } else {
    ctx.drawImage(img, drawable.x, drawable.y, drawable.width, drawable.height)
  }

  ctx.restore()
}

/**
 * 描画要素をCanvas 2Dにレンダリング（タイプ別にディスパッチ）
 * @param ctx - Canvas 2D コンテキスト
 * @param drawable - レンダリングする描画要素
 */
export const renderDrawable2D = async (
  ctx: CanvasRenderingContext2D,
  drawable: Drawable
): Promise<void> => {
  if (isStrokeDrawable(drawable)) {
    renderStroke2D(ctx, drawable)
  } else if (isImageDrawable(drawable)) {
    await renderImage2D(ctx, drawable)
  }
}

/**
 * 画像キャッシュをクリア
 */
export const clearImageCache2D = (): void => {
  imageCache.clear()
}

/**
 * 画像を事前に読み込む（レンダリング前に呼び出すことで即座に描画可能にする）
 */
export const preloadImage2D = async (src: string): Promise<void> => {
  await loadImage(src)
}
