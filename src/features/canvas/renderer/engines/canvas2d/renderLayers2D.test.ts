import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Layer } from '@/features/layer'
import { BACKGROUND_LAYER_ID } from '@/features/layer'

// renderDrawable2D をモック
vi.mock('./renderDrawable2D', () => ({
  renderDrawable2D: vi.fn(),
}))

// チェッカーボードパターンのモック
const mockPattern = {} as CanvasPattern

// jsdom環境でgetContextがnullを返す場合があるため、モックを設定
const mockLayerContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  createPattern: vi.fn().mockReturnValue(mockPattern),
  fillStyle: '' as string | CanvasPattern,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
} as unknown as CanvasRenderingContext2D

const originalGetContext = HTMLCanvasElement.prototype.getContext
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockLayerContext)
})

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
})

describe('renderLayers2D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('キャンバスをクリアする', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    await renderLayers2D(mockCtx, [], 800, 600)

    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
  })

  test('空のレイヤー配列でもエラーにならない', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    await expect(renderLayers2D(mockCtx, [], 800, 600)).resolves.not.toThrow()
  })

  test('非表示レイヤーはスキップする', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')
    const { renderDrawable2D } = await import('./renderDrawable2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        drawables: [
          {
            id: 'stroke-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
            style: {
              color: '#000000',
              brushTip: { type: 'solid', size: 3, opacity: 1, hardness: 0 },
              blendMode: 'normal',
            },
          },
        ],
        isVisible: false, // 非表示
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // 非表示なので描画されない
    expect(renderDrawable2D).not.toHaveBeenCalled()
  })

  test('背景レイヤーが表示の場合は白背景を描画する', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: BACKGROUND_LAYER_ID,
        name: 'Background',
        type: 'background',
        drawables: [],
        isVisible: true,
        isLocked: true,
        opacity: 1,
        blendMode: 'normal',
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // 白背景が描画される
    expect(mockCtx.fillStyle).toBe('#ffffff')
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
  })

  test('描画要素が空のレイヤーはスキップする', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Empty Layer',
        type: 'drawing',
        drawables: [], // 空
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // 空のレイヤーはdrawImageされない
    expect(mockCtx.drawImage).not.toHaveBeenCalled()
  })

  test('チェッカーボードパターンを描画する', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    await renderLayers2D(mockCtx, [], 800, 600)

    // createPatternが呼ばれてパターンが作成される
    expect(mockCtx.createPattern).toHaveBeenCalled()
    // パターンがfillStyleに設定される
    expect(mockCtx.fillStyle).toBe(mockPattern)
    // チェッカーボードがキャンバス全体に描画される
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
  })

  test('チェッカーボードパターンはキャッシュされる', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    // 2回レンダリング
    await renderLayers2D(mockCtx, [], 800, 600)
    await renderLayers2D(mockCtx, [], 800, 600)

    // createPatternは1回だけ呼ばれる（キャッシュされる）
    expect(mockCtx.createPattern).toHaveBeenCalledTimes(1)
  })

  test('normalブレンドモードかつ不透明度100%のレイヤーは直接描画される', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')
    const { renderDrawable2D } = await import('./renderDrawable2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        drawables: [
          {
            id: 'stroke-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
            style: {
              color: '#000000',
              brushTip: { type: 'solid', size: 3, opacity: 1, hardness: 0 },
              blendMode: 'normal',
            },
          },
        ],
        isVisible: true,
        isLocked: false,
        opacity: 1, // 100%
        blendMode: 'normal', // normalブレンドモード
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // renderDrawable2Dが直接呼ばれる（メインコンテキストに）
    expect(renderDrawable2D).toHaveBeenCalled()
    // 中間キャンバスを使わないのでdrawImageは呼ばれない
    expect(mockCtx.drawImage).not.toHaveBeenCalled()
  })

  test('ブレンドモードがある場合は中間キャンバスを使用する', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')
    const { renderDrawable2D } = await import('./renderDrawable2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        drawables: [
          {
            id: 'stroke-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
            style: {
              color: '#000000',
              brushTip: { type: 'solid', size: 3, opacity: 1, hardness: 0 },
              blendMode: 'normal',
            },
          },
        ],
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'multiply', // 乗算ブレンドモード
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // 中間キャンバスにレンダリングされる
    expect(renderDrawable2D).toHaveBeenCalled()
    // drawImageで合成される
    expect(mockCtx.drawImage).toHaveBeenCalled()
  })

  test('不透明度が100%未満の場合は中間キャンバスを使用する', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')
    const { renderDrawable2D } = await import('./renderDrawable2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        drawables: [
          {
            id: 'stroke-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
            style: {
              color: '#000000',
              brushTip: { type: 'solid', size: 3, opacity: 1, hardness: 0 },
              blendMode: 'normal',
            },
          },
        ],
        isVisible: true,
        isLocked: false,
        opacity: 0.5, // 50%
        blendMode: 'normal',
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // 中間キャンバスにレンダリングされる
    expect(renderDrawable2D).toHaveBeenCalled()
    // drawImageで合成される
    expect(mockCtx.drawImage).toHaveBeenCalled()
  })

  test('消しゴムを含むレイヤーは中間キャンバスを使用する', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')
    const { renderDrawable2D } = await import('./renderDrawable2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        drawables: [
          {
            id: 'stroke-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
            style: {
              color: '#000000',
              brushTip: { type: 'solid', size: 3, opacity: 1, hardness: 0 },
              blendMode: 'normal',
            },
          },
          {
            id: 'eraser-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 5, y: 5 },
              { x: 15, y: 15 },
            ],
            style: {
              color: '#000000',
              brushTip: { type: 'solid', size: 10, opacity: 1, hardness: 0 },
              blendMode: 'erase', // 消しゴム
            },
          },
        ],
        isVisible: true,
        isLocked: false,
        opacity: 1, // 100%
        blendMode: 'normal', // normalブレンドモード
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // 消しゴムを含むため中間キャンバスにレンダリングされる
    expect(renderDrawable2D).toHaveBeenCalled()
    // drawImageで合成される（消しゴムが正しくレイヤー内で適用される）
    expect(mockCtx.drawImage).toHaveBeenCalled()
  })

  test('ぼかしを含むレイヤーは中間キャンバスを使用する', async () => {
    const { renderLayers2D } = await import('./renderLayers2D')
    const { renderDrawable2D } = await import('./renderDrawable2D')

    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createPattern: vi.fn().mockReturnValue(mockPattern),
      fillStyle: '' as string | CanvasPattern,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        drawables: [
          {
            id: 'stroke-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
            style: {
              color: '#ff0000',
              brushTip: { type: 'solid', size: 10, opacity: 1, hardness: 0 },
              blendMode: 'normal',
            },
          },
          {
            id: 'blur-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 5, y: 5 },
              { x: 15, y: 15 },
            ],
            style: {
              color: 'transparent',
              brushTip: { type: 'solid', size: 20, opacity: 1, hardness: 0.5 },
              blendMode: 'blur', // ぼかし
            },
          },
        ],
        isVisible: true,
        isLocked: false,
        opacity: 1, // 100%
        blendMode: 'normal', // normalブレンドモード
      },
    ]

    await renderLayers2D(mockCtx, layers, 800, 600)

    // ぼかしを含むため中間キャンバスにレンダリングされる
    expect(renderDrawable2D).toHaveBeenCalled()
    // drawImageで合成される（ぼかしが下のレイヤーに影響しないよう分離される）
    expect(mockCtx.drawImage).toHaveBeenCalled()
  })
})
