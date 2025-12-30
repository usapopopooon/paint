import { Application, Container, Graphics, RenderTexture, Sprite } from 'pixi.js'
import type { Layer } from '@/features/layer'
import { blendModeToPixi } from '@/features/layer'
import { renderDrawable, isEraserStroke } from '@/features/drawable'

/**
 * 背景をステージに追加
 */
const addBackground = (app: Application, backgroundColor: string): void => {
  const background = new Graphics()
  background.rect(0, 0, app.screen.width, app.screen.height)
  background.fill(backgroundColor)
  app.stage.addChild(background)
}

/**
 * レイヤーをRenderTextureにレンダリングしてSpriteとして返す
 */
const renderLayerToTexture = (app: Application, layer: Layer): Sprite => {
  const renderTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height,
  })

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
 * レイヤーをPixiJS Applicationにレンダリング
 * RenderTextureを使用して消しゴムが正しく機能するようにする
 * @param app - PixiJS Application
 * @param layers - レンダリングするレイヤー配列
 * @param backgroundColor - 背景色
 */
export const renderLayers = (
  app: Application,
  layers: readonly Layer[],
  backgroundColor: string
): void => {
  app.stage.removeChildren()
  addBackground(app, backgroundColor)

  for (const layer of layers) {
    if (!layer.isVisible || layer.drawables.length === 0) continue
    const layerSprite = renderLayerToTexture(app, layer)
    app.stage.addChild(layerSprite)
  }
}
