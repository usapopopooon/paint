import { Application, Container, Graphics } from 'pixi.js'
import type { BLEND_MODES } from 'pixi.js'
import type { LayerRenderer } from '../../domain/interfaces'
import type { Layer, LayerBlendMode } from '../../types'
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
 * PixiJSレンダラーを作成
 * @returns レイヤーレンダリング用のLayerRendererインスタンス
 */
export const createCanvas2DRenderer = (): LayerRenderer => {
  let app: Application | null = null
  let isInitialized = false
  let pendingRender: (() => void) | null = null

  // 非同期で初期化
  const initApp = async (width: number, height: number, backgroundColor: string) => {
    app = new Application()
    await app.init({
      width,
      height,
      backgroundColor,
      antialias: true,
    })
    isInitialized = true

    // 初期化待ちのレンダリングがあれば実行
    if (pendingRender) {
      pendingRender()
      pendingRender = null
    }
  }

  const render = (
    layers: readonly Layer[],
    width: number,
    height: number,
    backgroundColor: string
  ): void => {
    if (!app || !isInitialized) {
      // 初期化がまだの場合は開始して、レンダリングを保留
      if (!app) {
        pendingRender = () => render(layers, width, height, backgroundColor)
        initApp(width, height, backgroundColor)
      }
      return
    }

    // 必要に応じてリサイズ
    if (app.canvas.width !== width || app.canvas.height !== height) {
      app.renderer.resize(width, height)
    }

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

  const dispose = (): void => {
    if (app) {
      app.destroy(true, { children: true })
      app = null
      isInitialized = false
    }
  }

  const getCanvas = (): HTMLCanvasElement => {
    if (!app) {
      // 初期化前はダミーキャンバスを返す
      return document.createElement('canvas')
    }
    return app.canvas
  }

  return {
    render,
    dispose,
    getCanvas,
  }
}
