import type { Layer } from '../../types'
import type { Drawable, ImageDrawable } from '@/features/drawable'
import { createImageDrawable } from '@/features/drawable'
import { renderDrawable2D } from '@/features/canvas/renderer/engines/canvas2d/renderDrawable2D'
import { blendModeToCompositeOp } from './blendModeToCompositeOp'

/**
 * レイヤーをCanvasにレンダリング
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
 * 上レイヤーを下レイヤーにマージした結果のDrawablesを返す
 * ブレンドモードと不透明度を正しく適用してCanvasでレンダリングする
 *
 * @param upperLayer - マージする上レイヤー
 * @param lowerLayer - マージ先の下レイヤー
 * @param canvasWidth - キャンバスの幅
 * @param canvasHeight - キャンバスの高さ
 * @returns マージ後のDrawables配列
 */
export const mergeLayerToImage = async (
  upperLayer: Layer,
  lowerLayer: Layer,
  canvasWidth: number,
  canvasHeight: number
): Promise<readonly Drawable[]> => {
  // 上レイヤーが空の場合は下レイヤーのDrawablesをそのまま返す
  if (upperLayer.drawables.length === 0) {
    return lowerLayer.drawables
  }

  // 下レイヤーが空で、上レイヤーがnormal/100%の場合はDrawablesをそのまま移動
  if (
    lowerLayer.drawables.length === 0 &&
    upperLayer.blendMode === 'normal' &&
    upperLayer.opacity === 1
  ) {
    return upperLayer.drawables
  }

  // 上レイヤーがnormal/100%の場合は単純にDrawablesを結合
  if (upperLayer.blendMode === 'normal' && upperLayer.opacity === 1) {
    return [...lowerLayer.drawables, ...upperLayer.drawables]
  }

  // ブレンドモードや不透明度が設定されている場合はCanvasでレンダリング
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = canvasWidth
  resultCanvas.height = canvasHeight
  const ctx = resultCanvas.getContext('2d')!

  // まず下レイヤーをレンダリング
  const lowerCanvas = await renderLayerToCanvas(lowerLayer, canvasWidth, canvasHeight)
  ctx.drawImage(lowerCanvas, 0, 0)

  // 上レイヤーをブレンドモードと不透明度を適用してレンダリング
  const upperCanvas = await renderLayerToCanvas(upperLayer, canvasWidth, canvasHeight)
  ctx.save()
  ctx.globalAlpha = upperLayer.opacity
  ctx.globalCompositeOperation = blendModeToCompositeOp(upperLayer.blendMode)
  ctx.drawImage(upperCanvas, 0, 0)
  ctx.restore()

  // 結果をbase64エンコード
  const dataUrl = resultCanvas.toDataURL('image/png')

  // ImageDrawableとして返す
  const mergedImage: ImageDrawable = createImageDrawable({
    src: dataUrl,
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
  })

  // メモリリーク防止: 一時キャンバスを解放
  lowerCanvas.width = 0
  lowerCanvas.height = 0
  upperCanvas.width = 0
  upperCanvas.height = 0
  resultCanvas.width = 0
  resultCanvas.height = 0

  return [mergedImage]
}
