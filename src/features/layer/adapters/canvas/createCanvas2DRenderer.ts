import { Application, Container, Graphics, RenderTexture, Sprite } from 'pixi.js'
import type { LayerRenderer } from '../../domain/interfaces'
import type { Layer } from '../../types'
import { blendModeToPixi } from './blendModeToPixi'
import { renderDrawable, isEraserStroke } from '@/features/drawable'

/**
 * 背景をステージに追加
 */
const addBackground = (
  app: Application,
  width: number,
  height: number,
  backgroundColor: string
): void => {
  const background = new Graphics()
  background.rect(0, 0, width, height)
  background.fill(backgroundColor)
  app.stage.addChild(background)
}

/**
 * レイヤーをRenderTextureにレンダリングしてSpriteとして返す
 */
const renderLayerToTexture = (
  app: Application,
  layer: Layer,
  width: number,
  height: number
): Sprite => {
  const renderTexture = RenderTexture.create({ width, height })

  const tempContainer = new Container()
  for (const drawable of layer.drawables) {
    const graphics = new Graphics()
    if (isEraserStroke(drawable)) {
      graphics.blendMode = 'erase'
    }
    renderDrawable(graphics, drawable)
    tempContainer.addChild(graphics)
  }

  app.renderer.render({ container: tempContainer, target: renderTexture })
  tempContainer.destroy({ children: true })

  const sprite = new Sprite(renderTexture)
  sprite.alpha = layer.opacity
  sprite.blendMode = blendModeToPixi(layer.blendMode)
  return sprite
}

/**
 * PixiJSレンダラーを作成
 * @returns レイヤーレンダリング用のLayerRendererインスタンス
 */
export const createCanvas2DRenderer = (): LayerRenderer => {
  let app: Application | null = null
  let isInitialized = false
  let pendingRender: (() => void) | null = null

  const initApp = async (width: number, height: number, backgroundColor: string) => {
    app = new Application()
    await app.init({
      width,
      height,
      backgroundColor,
      antialias: true,
    })
    isInitialized = true

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
      if (!app) {
        pendingRender = () => render(layers, width, height, backgroundColor)
        initApp(width, height, backgroundColor)
      }
      return
    }

    if (app.canvas.width !== width || app.canvas.height !== height) {
      app.renderer.resize(width, height)
    }

    app.stage.removeChildren()
    addBackground(app, width, height, backgroundColor)

    for (const layer of layers) {
      if (!layer.isVisible || layer.drawables.length === 0) continue
      const layerSprite = renderLayerToTexture(app, layer, width, height)
      app.stage.addChild(layerSprite)
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
      return document.createElement('canvas')
    }
    return app.canvas
  }

  return { render, dispose, getCanvas }
}
