import { Sprite, Texture, Assets } from 'pixi.js'
import type { ImageDrawable } from '../../types'

// 画像テクスチャのキャッシュ
const textureCache = new Map<string, Texture>()

/**
 * 画像描画要素をPixiJS Spriteとしてレンダリング
 * @param drawable - レンダリングする画像描画要素
 * @returns 作成されたSprite
 */
export const renderImage = async (drawable: ImageDrawable): Promise<Sprite> => {
  let texture = textureCache.get(drawable.src)

  if (!texture) {
    const loadedTexture = await Assets.load<Texture>(drawable.src)
    texture = loadedTexture
    textureCache.set(drawable.src, loadedTexture)
  }

  const sprite = new Sprite(texture)
  sprite.width = drawable.width
  sprite.height = drawable.height
  sprite.x = drawable.x
  sprite.y = drawable.y

  // scaleXが負の場合（水平反転時）
  if (drawable.scaleX < 0) {
    sprite.anchor.x = 1
    sprite.scale.x = -1
    sprite.x = drawable.x
  }

  // scaleYが負の場合（垂直反転時）
  if (drawable.scaleY < 0) {
    sprite.anchor.y = 1
    sprite.scale.y = -1
    sprite.y = drawable.y
  }

  return sprite
}

/**
 * テクスチャキャッシュをクリア
 */
export const clearImageCache = (): void => {
  textureCache.clear()
}
