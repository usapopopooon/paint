import type { Layer } from '@/features/layer'
import { blendModeToCompositeOp, BACKGROUND_COLOR, BACKGROUND_LAYER_ID } from '@/features/layer'
import { renderDrawable2D } from './renderDrawable2D'

/**
 * チェッカーボードパターン（透明を表す背景）を描画
 */
const drawCheckerboard = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tileSize: number = 10
): void => {
  const cols = Math.ceil(width / tileSize)
  const rows = Math.ceil(height / tileSize)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#cccccc'
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize)
    }
  }
}

/**
 * レイヤーを一時キャンバスにレンダリング
 */
const renderLayerToCanvas = async (
  layer: Layer,
  width: number,
  height: number
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  for (const drawable of layer.drawables) {
    await renderDrawable2D(ctx, drawable)
  }

  return canvas
}

/**
 * レイヤーをCanvas 2Dにレンダリング
 * @param ctx - Canvas 2D コンテキスト
 * @param layers - レンダリングするレイヤー配列
 * @param width - キャンバス幅
 * @param height - キャンバス高さ
 */
export const renderLayers2D = async (
  ctx: CanvasRenderingContext2D,
  layers: readonly Layer[],
  width: number,
  height: number
): Promise<void> => {
  // キャンバスをクリア
  ctx.clearRect(0, 0, width, height)

  // チェッカーボードを最下層に描画（透明度の可視化のため）
  drawCheckerboard(ctx, width, height)

  // 背景レイヤーが表示状態かチェック
  let hasBackground = false
  for (const layer of layers) {
    if (layer.id === BACKGROUND_LAYER_ID && layer.isVisible) {
      hasBackground = true
      break
    }
  }

  // 背景レイヤーがある場合は白背景を描画
  if (hasBackground) {
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, width, height)
  }

  // 各レイヤーを描画
  for (const layer of layers) {
    if (!layer.isVisible) continue
    if (layer.id === BACKGROUND_LAYER_ID) continue // 背景は上で処理済み
    if (layer.drawables.length === 0) continue

    // レイヤーを一時キャンバスにレンダリング
    const layerCanvas = await renderLayerToCanvas(layer, width, height)

    // レイヤーの透明度とブレンドモードを設定して合成
    ctx.save()
    ctx.globalAlpha = layer.opacity
    ctx.globalCompositeOperation = blendModeToCompositeOp(layer.blendMode)
    ctx.drawImage(layerCanvas, 0, 0)
    ctx.restore()
  }
}
