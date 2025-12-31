import { Application, Container, Graphics, RenderTexture, Sprite, BlurFilter } from 'pixi.js'
import type { Drawable } from '@/features/drawable'
import {
  renderDrawable,
  renderImage,
  isEraserStroke,
  isStrokeDrawable,
  isImageDrawable,
} from '@/features/drawable'

/**
 * Drawableからhardness値を取得（0=ぼかしなし、1=最大ぼかし）
 */
const getHardness = (drawable: Drawable): number => {
  if (isStrokeDrawable(drawable)) {
    return drawable.style.brushTip.hardness
  }
  return 0
}

/**
 * hardness値からBlurFilterの強度を計算
 * hardness=0 → blur=0（ぼかしなし）
 * hardness=1 → blur=最大値（ブラシサイズに応じた最大ぼかし）
 */
const calculateBlurStrength = (hardness: number, brushSize: number): number => {
  // hardnessが0の場合はブラーなし
  if (hardness === 0) return 0
  // ブラシサイズの約1/4をベースに、hardnessで調整
  return hardness * Math.max(1, brushSize * 0.25)
}

/**
 * 描画要素をRenderTextureにレンダリングしてSpriteとして返す
 */
const renderToTexture = async (
  app: Application,
  drawables: readonly Drawable[]
): Promise<Sprite> => {
  const renderTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height,
  })

  const tempContainer = new Container()
  for (const drawable of drawables) {
    // 画像の場合はSpriteとして追加
    if (isImageDrawable(drawable)) {
      const sprite = await renderImage(drawable)
      tempContainer.addChild(sprite)
      continue
    }

    const graphics = new Graphics()
    if (isEraserStroke(drawable)) {
      graphics.blendMode = 'erase'
    }
    renderDrawable(graphics, drawable)

    // hardnessに基づいてブラーフィルターを適用（消しゴムには適用しない - BlurFilterとeraseブレンドモードは両立不可）
    const hardness = getHardness(drawable)
    if (hardness > 0 && isStrokeDrawable(drawable) && !isEraserStroke(drawable)) {
      const blurStrength = calculateBlurStrength(hardness, drawable.style.brushTip.size)
      graphics.filters = [new BlurFilter({ strength: blurStrength })]
    }

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
 */
export const renderDrawables = async (
  app: Application,
  drawables: readonly Drawable[]
): Promise<void> => {
  app.stage.removeChildren()

  if (drawables.length === 0) return

  const layerSprite = await renderToTexture(app, drawables)
  app.stage.addChild(layerSprite)
}
