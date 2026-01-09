import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

// clearImageCache2D のモック
vi.mock('./canvas2d', () => ({
  renderDrawables2D: vi.fn(),
  renderLayers2D: vi.fn(),
  clearImageCache2D: vi.fn(),
}))

// jsdom環境でgetContextがnullを返す場合があるため、モックを設定
const mockContext = {
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
  clearRect: vi.fn(),
} as unknown as CanvasRenderingContext2D

const originalGetContext = HTMLCanvasElement.prototype.getContext
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext)
})

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
})

describe('Canvas2DEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('初期化前はisInitializedがfalse', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()
    expect(engine.isInitialized).toBe(false)
  })

  test('initでキャンバスを作成する', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()
    await engine.init({ width: 800, height: 600 })

    expect(engine.isInitialized).toBe(true)
    const canvas = engine.getCanvas()
    expect(canvas.width).toBe(800)
    expect(canvas.height).toBe(600)
  })

  test('disposeでリソースを解放する', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()
    await engine.init({ width: 800, height: 600 })
    engine.dispose()

    expect(engine.isInitialized).toBe(false)
  })

  test('resizeでキャンバスサイズを変更する', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()
    await engine.init({ width: 800, height: 600 })
    engine.resize(1024, 768)

    const canvas = engine.getCanvas()
    expect(canvas.width).toBe(1024)
    expect(canvas.height).toBe(768)
  })

  test('初期化前にgetCanvasを呼ぶとエラー', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()

    expect(() => engine.getCanvas()).toThrow('Renderer is not initialized')
  })

  test('初期化前にrenderDrawablesを呼ぶとエラー', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()

    await expect(engine.renderDrawables([])).rejects.toThrow('Renderer is not initialized')
  })

  test('初期化前にrenderLayersを呼ぶとエラー', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()

    await expect(engine.renderLayers([])).rejects.toThrow('Renderer is not initialized')
  })

  test('clearImageCacheでキャッシュをクリアする', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')
    const { clearImageCache2D } = await import('./canvas2d')

    const engine = new Canvas2DEngine()
    engine.clearImageCache()

    expect(clearImageCache2D).toHaveBeenCalled()
  })

  test('初期化前にclearを呼んでもエラーにならない', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()
    expect(() => engine.clear()).not.toThrow()
  })

  test('初期化前にresizeを呼んでもエラーにならない', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()
    expect(() => engine.resize(1024, 768)).not.toThrow()
  })

  test('初期化前にdisposeを呼んでもエラーにならない', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')

    const engine = new Canvas2DEngine()
    expect(() => engine.dispose()).not.toThrow()
  })

  test('renderDrawablesでCanvas2D描画関数を呼び出す', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')
    const { renderDrawables2D } = await import('./canvas2d')

    const engine = new Canvas2DEngine()
    await engine.init({ width: 800, height: 600 })
    await engine.renderDrawables([])

    expect(renderDrawables2D).toHaveBeenCalled()
  })

  test('renderLayersでCanvas2D描画関数を呼び出す', async () => {
    const { Canvas2DEngine } = await import('./canvas2dEngine')
    const { renderLayers2D } = await import('./canvas2d')

    const engine = new Canvas2DEngine()
    await engine.init({ width: 800, height: 600 })
    await engine.renderLayers([])

    expect(renderLayers2D).toHaveBeenCalled()
  })
})
