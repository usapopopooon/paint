import type { Drawable } from '@/features/drawable'
import { renderDrawable } from '@/features/drawable'

/**
 * 描画要素をキャンバスにレンダリング
 * @param ctx - 描画先のキャンバスコンテキスト
 * @param drawables - レンダリングするDrawable配列
 * @param width - キャンバスの幅
 * @param height - キャンバスの高さ
 * @param backgroundColor - 背景色
 */
export const renderDrawables = (
  ctx: CanvasRenderingContext2D,
  drawables: readonly Drawable[],
  width: number,
  height: number,
  backgroundColor: string
): void => {
  // メインキャンバスをクリアして背景で塗りつぶす
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // 描画要素用のオフスクリーンキャンバスを作成（消しゴムが背景を消さないように）
  const offscreen = new OffscreenCanvas(width, height)
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return

  // オフスクリーンキャンバスに全描画要素を描画（透明背景）
  offCtx.clearRect(0, 0, width, height)
  drawables.forEach((drawable) => renderDrawable(offCtx, drawable))

  // 描画要素をメインキャンバスに合成
  ctx.drawImage(offscreen, 0, 0)
}
