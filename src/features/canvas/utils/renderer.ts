import type { Drawable } from '@/features/drawable'
import { renderDrawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { blendModeToCompositeOp } from '@/features/layer'

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

/**
 * レイヤーをキャンバスにレンダリング
 * 各レイヤーは独自のブレンドモードと不透明度でレンダリングされる
 * @param ctx - 描画先のキャンバスコンテキスト
 * @param layers - レンダリングするレイヤー配列
 * @param width - キャンバスの幅
 * @param height - キャンバスの高さ
 * @param backgroundColor - 背景色
 */
export const renderLayers = (
  ctx: CanvasRenderingContext2D,
  layers: readonly Layer[],
  width: number,
  height: number,
  backgroundColor: string
): void => {
  // 背景を塗りつぶす
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // 各レイヤーをレンダリング
  for (const layer of layers) {
    if (!layer.visible || layer.drawables.length === 0) continue

    // レイヤー用のオフスクリーンキャンバスを作成
    const offscreen = new OffscreenCanvas(width, height)
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) continue

    // オフスクリーンキャンバスに描画要素を描画
    layer.drawables.forEach((drawable) => renderDrawable(offCtx, drawable))

    // ブレンドモードと不透明度を適用
    ctx.globalCompositeOperation = blendModeToCompositeOp(layer.blendMode)
    ctx.globalAlpha = layer.opacity
    ctx.drawImage(offscreen, 0, 0)

    // 合成操作とアルファをリセット
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
}
