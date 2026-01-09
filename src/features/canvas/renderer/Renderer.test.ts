import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { StrokeDrawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { createSolidBrushTip } from '@/features/brush'

// モック用のエンジンインスタンス
const mockEngineInstance = {
  isInitialized: false,
  init: vi.fn().mockImplementation(async function () {
    mockEngineInstance.isInitialized = true
  }),
  dispose: vi.fn().mockImplementation(function () {
    mockEngineInstance.isInitialized = false
  }),
  resize: vi.fn(),
  getCanvas: vi.fn().mockReturnValue(document.createElement('canvas')),
  renderDrawables: vi.fn(),
  renderLayers: vi.fn(),
  clear: vi.fn(),
  clearImageCache: vi.fn(),
}

// PixiEngineをモッククラスとして定義
class MockPixiEngine {
  get isInitialized() {
    return mockEngineInstance.isInitialized
  }
  init = mockEngineInstance.init
  dispose = mockEngineInstance.dispose
  resize = mockEngineInstance.resize
  getCanvas = mockEngineInstance.getCanvas
  renderDrawables = mockEngineInstance.renderDrawables
  renderLayers = mockEngineInstance.renderLayers
  clear = mockEngineInstance.clear
  clearImageCache = mockEngineInstance.clearImageCache
}

vi.mock('./engines/pixiEngine', () => ({
  PixiEngine: MockPixiEngine,
}))

describe('Renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEngineInstance.isInitialized = false
  })

  test('デフォルトでpixiエンジンを使用する', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer()
    expect(renderer.engineType).toBe('pixi')
  })

  test('エンジンタイプを指定して作成できる', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    expect(renderer.engineType).toBe('pixi')
  })

  test('canvasエンジンは未実装のためエラーになる', async () => {
    const { Renderer } = await import('./Renderer')

    expect(() => new Renderer('canvas')).toThrow('Canvas 2D engine is not yet implemented')
  })

  test('初期化前はisInitializedがfalse', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    expect(renderer.isInitialized).toBe(false)
  })

  test('初期化後はisInitializedがtrue', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })

    expect(renderer.isInitialized).toBe(true)
  })

  test('disposeでリソースを解放する', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })
    renderer.dispose()

    expect(renderer.isInitialized).toBe(false)
  })

  test('resizeでサイズを変更する', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })
    renderer.resize(1024, 768)

    expect(mockEngineInstance.resize).toHaveBeenCalledWith(1024, 768)
  })

  test('getCanvasでキャンバス要素を取得する', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })
    const canvas = renderer.getCanvas()

    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
  })

  test('renderDrawablesで描画要素をレンダリングする', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })

    const drawables: StrokeDrawable[] = [
      {
        id: 'stroke-1',
        type: 'stroke',
        createdAt: Date.now(),
        points: [{ x: 0, y: 0 }],
        style: {
          color: '#000000',
          brushTip: createSolidBrushTip(3),
          blendMode: 'normal',
        },
      },
    ]

    await renderer.renderDrawables(drawables)

    expect(mockEngineInstance.renderDrawables).toHaveBeenCalledWith(drawables)
  })

  test('renderLayersでレイヤーをレンダリングする', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        drawables: [],
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
      },
    ]

    await renderer.renderLayers(layers)

    expect(mockEngineInstance.renderLayers).toHaveBeenCalledWith(layers)
  })

  test('clearでステージをクリアする', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })
    renderer.clear()

    expect(mockEngineInstance.clear).toHaveBeenCalled()
  })

  test('clearImageCacheで画像キャッシュをクリアする', async () => {
    const { Renderer } = await import('./Renderer')

    const renderer = new Renderer('pixi')
    await renderer.init({ width: 800, height: 600 })
    renderer.clearImageCache()

    expect(mockEngineInstance.clearImageCache).toHaveBeenCalled()
  })
})
