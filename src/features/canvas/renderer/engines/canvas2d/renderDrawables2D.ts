import type { Drawable } from '@/features/drawable'
import { renderDrawable2D } from './renderDrawable2D'

/**
 * 描画要素をCanvas 2Dにレンダリング
 * @param ctx - Canvas 2D コンテキスト
 * @param drawables - レンダリングするDrawable配列
 * @param width - キャンバス幅
 * @param height - キャンバス高さ
 */
export const renderDrawables2D = async (
  ctx: CanvasRenderingContext2D,
  drawables: readonly Drawable[],
  width: number,
  height: number
): Promise<void> => {
  // キャンバスをクリア
  ctx.clearRect(0, 0, width, height)

  if (drawables.length === 0) return

  for (const drawable of drawables) {
    await renderDrawable2D(ctx, drawable)
  }
}
