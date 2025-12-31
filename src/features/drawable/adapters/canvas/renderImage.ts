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
  sprite.x = drawable.x
  sprite.y = drawable.y
  sprite.width = drawable.width
  sprite.height = drawable.height

  return sprite
}

/**
 * テクスチャキャッシュをクリア
 */
export const clearImageCache = (): void => {
  textureCache.clear()
}
