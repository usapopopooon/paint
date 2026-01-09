import { describe, test, expect, vi, beforeEach } from 'vitest'

// clearImageCache のモック
vi.mock('@/features/drawable', () => ({
  clearImageCache: vi.fn(),
}))

describe('PixiEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('初期化前はisInitializedがfalse', async () => {
    const { PixiEngine } = await import('./pixiEngine')

    const engine = new PixiEngine()
    expect(engine.isInitialized).toBe(false)
  })

  test('初期化前にgetCanvasを呼ぶとエラー', async () => {
    const { PixiEngine } = await import('./pixiEngine')

    const engine = new PixiEngine()

    expect(() => engine.getCanvas()).toThrow('Renderer is not initialized')
  })

  test('初期化前にrenderDrawablesを呼ぶとエラー', async () => {
    const { PixiEngine } = await import('./pixiEngine')

    const engine = new PixiEngine()

    await expect(engine.renderDrawables([])).rejects.toThrow('Renderer is not initialized')
  })

  test('初期化前にrenderLayersを呼ぶとエラー', async () => {
    const { PixiEngine } = await import('./pixiEngine')

    const engine = new PixiEngine()

    await expect(engine.renderLayers([])).rejects.toThrow('Renderer is not initialized')
  })

  test('clearImageCacheでキャッシュをクリアする', async () => {
    const { PixiEngine } = await import('./pixiEngine')
    const { clearImageCache } = await import('@/features/drawable')

    const engine = new PixiEngine()
    engine.clearImageCache()

    expect(clearImageCache).toHaveBeenCalled()
  })

  test('初期化前にclearを呼んでもエラーにならない', async () => {
    const { PixiEngine } = await import('./pixiEngine')

    const engine = new PixiEngine()
    expect(() => engine.clear()).not.toThrow()
  })

  test('初期化前にresizeを呼んでもエラーにならない', async () => {
    const { PixiEngine } = await import('./pixiEngine')

    const engine = new PixiEngine()
    expect(() => engine.resize(1024, 768)).not.toThrow()
  })

  test('初期化前にdisposeを呼んでもエラーにならない', async () => {
    const { PixiEngine } = await import('./pixiEngine')

    const engine = new PixiEngine()
    expect(() => engine.dispose()).not.toThrow()
  })
})
