import { Application, Container, Graphics } from 'pixi.js'
import type { BLEND_MODES } from 'pixi.js'
import type { Layer, LayerBlendMode } from '@/features/layer'
import { renderDrawable } from '@/features/drawable'

/**
 * LayerBlendModeをPixiJSのブレンドモードにマッピング
 */
const blendModeToPixi = (mode: LayerBlendMode): BLEND_MODES => {
  const map: Record<LayerBlendMode, BLEND_MODES> = {
    normal: 'normal',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay',
    darken: 'darken',
    lighten: 'lighten',
  }
  return map[mode]
}

/**
 * レイヤーをPixiJS Applicationにレンダリング
 * 各レイヤーは独自のブレンドモードと不透明度でレンダリングされる
 * @param app - PixiJS Application
 * @param layers - レンダリングするレイヤー配列
 * @param backgroundColor - 背景色
 */
export const renderLayers = (
  app: Application,
  layers: readonly Layer[],
  backgroundColor: string
): void => {
  // ステージをクリア
  app.stage.removeChildren()

  // 背景色を設定
  app.renderer.background.color = backgroundColor

  // 各レイヤーをレンダリング
  for (const layer of layers) {
    if (!layer.isVisible || layer.drawables.length === 0) continue

    // レイヤー用のコンテナを作成
    const layerContainer = new Container()
    layerContainer.alpha = layer.opacity
    layerContainer.blendMode = blendModeToPixi(layer.blendMode)
    app.stage.addChild(layerContainer)

    // レイヤー内の各描画要素をレンダリング
    layer.drawables.forEach((drawable) => {
      const graphics = new Graphics()

      // 消しゴムの場合はブレンドモードを設定
      if (drawable.type === 'stroke' && drawable.style.blendMode === 'erase') {
        graphics.blendMode = 'erase'
      }

      renderDrawable(graphics, drawable)
      layerContainer.addChild(graphics)
    })
  }
}
