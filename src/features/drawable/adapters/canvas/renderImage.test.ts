import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Sprite, Assets } from 'pixi.js'
import { renderImage, clearImageCache } from './renderImage'
import type { ImageDrawable } from '../../types'

// PixiJS Assetsをモック
vi.mock('pixi.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('pixi.js')>()
  return {
    ...original,
    Assets: {
      load: vi.fn().mockResolvedValue(original.Texture.EMPTY),
    },
  }
})

describe('renderImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearImageCache()
  })

  const createTestImageDrawable = (overrides?: Partial<ImageDrawable>): ImageDrawable => ({
    id: 'test-image-1',
    type: 'image',
    createdAt: Date.now(),
    src: 'data:image/png;base64,test',
    x: 100,
    y: 200,
    width: 300,
    height: 150,
    scaleX: 1,
    ...overrides,
  })

  test('ImageDrawableからSpriteを作成する', async () => {
    const drawable = createTestImageDrawable()

    const sprite = await renderImage(drawable)

    expect(sprite).toBeInstanceOf(Sprite)
    expect(sprite.x).toBe(100)
    expect(sprite.y).toBe(200)
    expect(sprite.width).toBe(300)
    expect(sprite.height).toBe(150)
  })

  test('scaleXが正の場合、通常の位置に配置される', async () => {
    const drawable = createTestImageDrawable({ scaleX: 1 })

    const sprite = await renderImage(drawable)

    expect(sprite.x).toBe(100)
    expect(sprite.anchor.x).toBe(0)
    // PixiJSはwidthを設定するとscale.xが変わるため、widthで検証
    expect(sprite.width).toBe(300)
  })

  test('scaleXが負の場合、画像が左右反転される', async () => {
    const drawable = createTestImageDrawable({ scaleX: -1 })

    const sprite = await renderImage(drawable)

    expect(sprite.anchor.x).toBe(1)
    expect(sprite.scale.x).toBe(-1)
    expect(sprite.x).toBe(100)
  })

  test('テクスチャがキャッシュされる', async () => {
    const drawable1 = createTestImageDrawable()
    const drawable2 = createTestImageDrawable({ id: 'test-image-2' })

    await renderImage(drawable1)
    await renderImage(drawable2)

    // 同じsrcなので、Assets.loadは1回だけ呼ばれる
    expect(Assets.load).toHaveBeenCalledTimes(1)
  })

  test('異なるsrcの場合、別々にロードされる', async () => {
    const drawable1 = createTestImageDrawable({ src: 'data:image/png;base64,test1' })
    const drawable2 = createTestImageDrawable({ src: 'data:image/png;base64,test2' })

    await renderImage(drawable1)
    await renderImage(drawable2)

    expect(Assets.load).toHaveBeenCalledTimes(2)
  })

  test('clearImageCacheでキャッシュがクリアされる', async () => {
    const drawable = createTestImageDrawable()

    await renderImage(drawable)
    clearImageCache()
    await renderImage(drawable)

    // キャッシュがクリアされたので、2回ロードされる
    expect(Assets.load).toHaveBeenCalledTimes(2)
  })
})
