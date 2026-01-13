import type { Layer } from '@/features/layer'
import { blendModeToCompositeOp, BACKGROUND_COLOR, BACKGROUND_LAYER_ID } from '@/features/layer'
import { isEraserStroke } from '@/features/drawable'
import { renderDrawable2D } from './renderDrawable2D'

/** チェッカーボードのタイルサイズ */
const CHECKERBOARD_TILE_SIZE = 10

/** キャッシュされたチェッカーボードパターン */
let cachedCheckerboardPattern: CanvasPattern | null = null

/**
 * チェッカーボードパターンを作成（2x2タイルの最小単位）
 */
const createCheckerboardPattern = (ctx: CanvasRenderingContext2D): CanvasPattern | null => {
  if (cachedCheckerboardPattern) {
    return cachedCheckerboardPattern
  }

  const tileSize = CHECKERBOARD_TILE_SIZE
  const patternCanvas = document.createElement('canvas')
  patternCanvas.width = tileSize * 2
  patternCanvas.height = tileSize * 2
  const patternCtx = patternCanvas.getContext('2d')
  if (!patternCtx) return null

  // 2x2のチェッカーボードパターンを描画
  patternCtx.fillStyle = '#ffffff'
  patternCtx.fillRect(0, 0, tileSize, tileSize)
  patternCtx.fillRect(tileSize, tileSize, tileSize, tileSize)
  patternCtx.fillStyle = '#cccccc'
  patternCtx.fillRect(tileSize, 0, tileSize, tileSize)
  patternCtx.fillRect(0, tileSize, tileSize, tileSize)

  cachedCheckerboardPattern = ctx.createPattern(patternCanvas, 'repeat')
  return cachedCheckerboardPattern
}

/**
 * チェッカーボードパターン（透明を表す背景）を描画
 */
const drawCheckerboard = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const pattern = createCheckerboardPattern(ctx)
  if (pattern) {
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)
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

    // 消しゴムを含むかチェック（消しゴムは中間キャンバスが必要）
    const hasEraser = layer.drawables.some(isEraserStroke)

    // normalブレンドモードかつ不透明度100%かつ消しゴムを含まない場合は直接描画（中間キャンバス不要）
    const canRenderDirectly = layer.blendMode === 'normal' && layer.opacity === 1 && !hasEraser

    if (canRenderDirectly) {
      // 直接描画（パフォーマンス最適化）
      for (const drawable of layer.drawables) {
        await renderDrawable2D(ctx, drawable)
      }
    } else {
      // ブレンドモードや透明度がある場合は中間キャンバスを使用
      const layerCanvas = await renderLayerToCanvas(layer, width, height)

      ctx.save()
      ctx.globalAlpha = layer.opacity
      ctx.globalCompositeOperation = blendModeToCompositeOp(layer.blendMode)
      ctx.drawImage(layerCanvas, 0, 0)
      ctx.restore()

      // メモリリーク防止: 一時キャンバスを明示的に解放
      layerCanvas.width = 0
      layerCanvas.height = 0
    }
  }
}
