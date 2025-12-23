import type { LayerRenderer } from '../../domain/interfaces'
import type { Layer } from '../../types'
import { renderDrawable } from '@/features/drawable'
import { blendModeToCompositeOp } from './blendModeToCompositeOp'

/**
 * Canvas 2Dレンダラーを作成
 * @returns レイヤーレンダリング用のLayerRendererインスタンス
 */
export const createCanvas2DRenderer = (): LayerRenderer => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  const render = (
    layers: readonly Layer[],
    width: number,
    height: number,
    backgroundColor: string
  ): void => {
    // 必要に応じてキャンバスサイズを更新
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

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

  const dispose = (): void => {
    // Canvas 2Dは明示的なクリーンアップ不要
    // ただしPixiJS互換性のためインターフェースでこのメソッドが必要
  }

  const getCanvas = (): HTMLCanvasElement => canvas

  return {
    render,
    dispose,
    getCanvas,
  }
}
