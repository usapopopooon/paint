import { Application, Container, Graphics, RenderTexture, Sprite, BlurFilter } from 'pixi.js'
import type { Layer } from '@/features/layer'
import { blendModeToPixi, BACKGROUND_COLOR, BACKGROUND_LAYER_ID } from '@/features/layer'
import type { Drawable } from '@/features/drawable'
import { renderDrawable, isEraserStroke, isStrokeDrawable } from '@/features/drawable'

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

  const sprite = new Sprite(renderTexture)
  sprite.alpha = layer.opacity
  sprite.blendMode = blendModeToPixi(layer.blendMode)
  return sprite
}

/**
 * レイヤーをPixiJS Applicationにレンダリング
 * RenderTextureを使用して消しゴムが正しく機能するようにする
 * 背景レイヤーが表示状態の場合、白背景を描画する
 * @param app - PixiJS Application
 * @param layers - レンダリングするレイヤー配列
 */
export const renderLayers = (app: Application, layers: readonly Layer[]): void => {
  app.stage.removeChildren()

  for (const layer of layers) {
    if (!layer.isVisible) continue

    // 背景レイヤーが表示状態の場合、白背景を描画
    if (layer.id === BACKGROUND_LAYER_ID) {
      addBackground(app, BACKGROUND_COLOR)
      continue
    }

    // 描画レイヤーはdrawablesがある場合のみ描画
    if (layer.drawables.length === 0) continue
    const layerSprite = renderLayerToTexture(app, layer)
    app.stage.addChild(layerSprite)
  }
}
