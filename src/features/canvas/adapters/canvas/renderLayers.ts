import { Application, Container, Graphics, RenderTexture, Sprite, BlurFilter } from 'pixi.js'
import type { Layer } from '@/features/layer'
import { blendModeToPixi, BACKGROUND_COLOR, BACKGROUND_LAYER_ID } from '@/features/layer'
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
 * チェッカーボードパターン（透明を表す背景）をステージに追加
 * レイヤーの透明度を正しく表示するためにPixiJS内で描画
 * パフォーマンス最適化: 同じ色のタイルをまとめて描画
 */
const addCheckerboard = (app: Application, tileSize: number = 20): void => {
  const checkerboard = new Graphics()
  const cols = Math.ceil(app.screen.width / tileSize)
  const rows = Math.ceil(app.screen.height / tileSize)

  // 白タイルをまとめて描画
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((row + col) % 2 === 0) {
        checkerboard.rect(col * tileSize, row * tileSize, tileSize, tileSize)
      }
    }
  }
  checkerboard.fill(0xffffff)

  // グレータイルをまとめて描画
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((row + col) % 2 !== 0) {
        checkerboard.rect(col * tileSize, row * tileSize, tileSize, tileSize)
      }
    }
  }
  checkerboard.fill(0xcccccc)

  app.stage.addChild(checkerboard)
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
const renderLayerToTexture = async (app: Application, layer: Layer): Promise<Sprite> => {
  const renderTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height,
  })

  const tempContainer = new Container()
  for (const drawable of layer.drawables) {
    // 画像の場合はSpriteとして追加
    if (isImageDrawable(drawable)) {
      const imageSprite = await renderImage(drawable)
      tempContainer.addChild(imageSprite)
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

  // RenderTextureにレンダリング（透明背景でクリア）
  app.renderer.render({ container: tempContainer, target: renderTexture, clear: true })
  tempContainer.destroy({ children: true })

  const sprite = new Sprite(renderTexture)
  // レイヤーの透明度をSpriteに適用
  // RenderTexture後に適用することで、透明背景に対しても透明度が反映される
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
export const renderLayers = async (app: Application, layers: readonly Layer[]): Promise<void> => {
  app.stage.removeChildren()

  // チェッカーボードを最下層に追加（透明度の可視化のため）
  addCheckerboard(app)

  for (const layer of layers) {
    if (!layer.isVisible) continue

    // 背景レイヤーが表示状態の場合、白背景を描画
    if (layer.id === BACKGROUND_LAYER_ID) {
      addBackground(app, BACKGROUND_COLOR)
      continue
    }

    // 描画レイヤーはdrawablesがある場合のみ描画
    if (layer.drawables.length === 0) continue
    const layerSprite = await renderLayerToTexture(app, layer)
    app.stage.addChild(layerSprite)
  }
}
