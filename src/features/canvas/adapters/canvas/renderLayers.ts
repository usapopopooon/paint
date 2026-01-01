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
 * チェッカーボードパターン（透明を表す背景）のGraphicsを作成
 * レイヤーの透明度を正しく表示するためにPixiJS内で描画
 * パフォーマンス最適化: 同じ色のタイルをまとめて描画
 */
const createCheckerboard = (width: number, height: number, tileSize: number = 20): Graphics => {
  const checkerboard = new Graphics()
  const cols = Math.ceil(width / tileSize)
  const rows = Math.ceil(height / tileSize)

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

  return checkerboard
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
 * チェッカーボードをステージに追加
 */
const addCheckerboard = (app: Application): void => {
  const checkerboard = createCheckerboard(app.screen.width, app.screen.height)
  app.stage.addChild(checkerboard)
}


/**
 * レイヤーを段階的に合成してRenderTextureに焼き付ける
 * これにより、ブレンドモードが正しく下のレイヤーに適用される
 */
const compositeLayersProgressively = async (
  app: Application,
  layerSprites: Sprite[]
): Promise<Sprite> => {
  if (layerSprites.length === 0) {
    return new Sprite()
  }

  if (layerSprites.length === 1) {
    return layerSprites[0]!
  }

  // 最初のレイヤーから開始
  let compositeTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height,
  })

  const firstSprite = layerSprites[0]!
  firstSprite.blendMode = 'normal' // 最初のレイヤーはnormalで描画
  app.renderer.render({ container: firstSprite, target: compositeTexture, clear: true })

  // 2番目以降のレイヤーを順に合成
  for (let i = 1; i < layerSprites.length; i++) {
    const currentSprite = layerSprites[i]!

    // 現在の合成結果をSpriteとして取得
    const compositeSprite = new Sprite(compositeTexture)

    // 新しいRenderTextureを作成
    const newCompositeTexture = RenderTexture.create({
      width: app.screen.width,
      height: app.screen.height,
    })

    // 合成用のContainerを作成
    const container = new Container()
    container.addChild(compositeSprite)
    container.addChild(currentSprite) // blendModeは既に設定されている

    // 新しいテクスチャにレンダリング
    app.renderer.render({ container, target: newCompositeTexture, clear: true })

    // 古いテクスチャを破棄
    compositeTexture.destroy()
    container.destroy({ children: false })
    compositeSprite.destroy()

    compositeTexture = newCompositeTexture
  }

  const finalSprite = new Sprite(compositeTexture)
  return finalSprite
}

/**
 * 白背景をRenderTextureにレンダリングしてSpriteとして返す
 */
const renderBackgroundToTexture = (app: Application, backgroundColor: string): Sprite => {
  const renderTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height,
  })

  const graphics = new Graphics()
  graphics.rect(0, 0, app.screen.width, app.screen.height)
  graphics.fill(backgroundColor)

  app.renderer.render({ container: graphics, target: renderTexture, clear: true })
  graphics.destroy()

  const sprite = new Sprite(renderTexture)
  sprite.blendMode = 'normal'
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

  // 描画レイヤーのSpriteを収集
  const layerSprites: Sprite[] = []
  let hasBackground = false

  for (const layer of layers) {
    if (!layer.isVisible) continue

    // 背景レイヤーが表示状態の場合
    if (layer.id === BACKGROUND_LAYER_ID) {
      hasBackground = true
      continue
    }

    // 描画レイヤーはdrawablesがある場合のみ描画
    if (layer.drawables.length === 0) continue
    const layerSprite = await renderLayerToTexture(app, layer)
    layerSprites.push(layerSprite)
  }

  // 背景がある場合は白背景Spriteを最下層に追加
  // 段階的合成に含めることでブレンドモードが正しく適用される
  if (hasBackground) {
    const backgroundSprite = renderBackgroundToTexture(app, BACKGROUND_COLOR)
    layerSprites.unshift(backgroundSprite)
  }

  // レイヤーが1つ以下の場合は直接追加
  if (layerSprites.length <= 1) {
    for (const sprite of layerSprites) {
      app.stage.addChild(sprite)
    }
    return
  }

  // 複数レイヤーを段階的に合成
  const compositedSprite = await compositeLayersProgressively(app, layerSprites)
  app.stage.addChild(compositedSprite)
}
