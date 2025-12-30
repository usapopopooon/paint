import { Application, Container, Graphics, RenderTexture, Sprite } from 'pixi.js'
import type { Drawable } from '@/features/drawable'
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
 * 描画要素をRenderTextureにレンダリングしてSpriteとして返す
 */
const renderToTexture = (app: Application, drawables: readonly Drawable[]): Sprite => {
  const renderTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height,
  })

  const tempContainer = new Container()
  for (const drawable of drawables) {
    const graphics = new Graphics()
    if (isEraserStroke(drawable)) {
      graphics.blendMode = 'erase'
    }
    renderDrawable(graphics, drawable)
    tempContainer.addChild(graphics)
  }

  app.renderer.render({ container: tempContainer, target: renderTexture })
  tempContainer.destroy({ children: true })

  return new Sprite(renderTexture)
}

/**
 * 描画要素をPixiJS Applicationにレンダリング
 * RenderTextureを使用して消しゴムが正しく機能するようにする
 * @param app - PixiJS Application
 * @param drawables - レンダリングするDrawable配列
 * @param backgroundColor - 背景色
 */
export const renderDrawables = (
  app: Application,
  drawables: readonly Drawable[],
  backgroundColor: string
): void => {
  app.stage.removeChildren()
  addBackground(app, backgroundColor)

  if (drawables.length === 0) return

  const layerSprite = renderToTexture(app, drawables)
  app.stage.addChild(layerSprite)
}
