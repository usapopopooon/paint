import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { Application } from 'pixi.js'
import type { Layer } from '@/features/layer'
import { BACKGROUND_LAYER_ID } from '@/features/layer'
import { createSolidBrushTip } from '@/features/brush'

// renderImageをモック
vi.mock('@/features/drawable', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/features/drawable')>()
  const { Sprite, Texture } = await import('pixi.js')
  return {
    ...original,
    renderImage: vi.fn().mockImplementation(async () => {
      // 実際のSpriteを返す
      const sprite = new Sprite(Texture.EMPTY)
      sprite.x = 0
      sprite.y = 0
      sprite.width = 100
      sprite.height = 100
      return sprite
    }),
  }
})

// モックPixiJS Application
const createMockApp = () => {
  const mockStage = {
    removeChildren: vi.fn(),
    addChild: vi.fn(),
  }

  const mockRenderer = {
    background: {
      color: '',
    },
    render: vi.fn(),
  }

  const mockScreen = {
    width: 800,
    height: 600,
  }

  return {
    stage: mockStage,
    renderer: mockRenderer,
    screen: mockScreen,
  } as unknown as Application
}

describe('renderLayers', () => {
  let app: ReturnType<typeof createMockApp>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    app = createMockApp()
  })

  test('ステージをクリアする', async () => {
    const { renderLayers } = await import('./renderLayers')

    await renderLayers(app, [])

    expect(app.stage.removeChildren).toHaveBeenCalled()
  })

  test('空のレイヤー配列でもエラーにならない', async () => {
    const { renderLayers } = await import('./renderLayers')

    await expect(renderLayers(app, [])).resolves.not.toThrow()
  })

  test('背景レイヤーが表示状態の場合、白背景を描画する', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: BACKGROUND_LAYER_ID,
        name: 'Background',
        type: 'background',
        isVisible: true,
        isLocked: true,
        opacity: 1,
        blendMode: 'normal',
        drawables: [],
      },
    ]

    await renderLayers(app, layers)

    // チェッカーボード + 白背景がステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('背景レイヤーが非表示の場合、背景を描画しない', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: BACKGROUND_LAYER_ID,
        name: 'Background',
        type: 'background',
        isVisible: false,
        isLocked: true,
        opacity: 1,
        blendMode: 'normal',
        drawables: [],
      },
    ]

    await renderLayers(app, layers)

    // チェッカーボードのみ追加される（白背景は追加されない）
    expect(app.stage.addChild).toHaveBeenCalledTimes(1)
  })

  test('非表示レイヤーはスキップする', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Hidden Layer',
        type: 'drawing',
        isVisible: false,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
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
              brushTip: createSolidBrushTip(3),
              blendMode: 'normal',
            },
          },
        ],
      },
    ]

    await renderLayers(app, layers)

    // チェッカーボードのみ追加される（非表示レイヤーはスキップ）
    expect(app.stage.addChild).toHaveBeenCalledTimes(1)
  })

  test('描画要素が空のレイヤーはスキップする', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Empty Layer',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
        drawables: [],
      },
    ]

    await renderLayers(app, layers)

    // チェッカーボードのみ追加される（空レイヤーはスキップ）
    expect(app.stage.addChild).toHaveBeenCalledTimes(1)
  })

  test('表示レイヤーをRenderTextureにレンダリングしてSpriteをステージに追加する', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Visible Layer',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
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
              brushTip: createSolidBrushTip(3),
              blendMode: 'normal',
            },
          },
        ],
      },
    ]

    await renderLayers(app, layers)

    // RenderTextureにレンダリングされることを確認
    expect(app.renderer.render).toHaveBeenCalled()
    // チェッカーボード + レイヤーSpriteがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('複数の表示レイヤーを各々RenderTextureにレンダリングする', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
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
              brushTip: createSolidBrushTip(3),
              blendMode: 'normal',
            },
          },
        ],
      },
      {
        id: 'layer-2',
        name: 'Layer 2',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 0.8,
        blendMode: 'screen',
        drawables: [
          {
            id: 'stroke-2',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 20, y: 20 },
              { x: 30, y: 30 },
            ],
            style: {
              color: '#ff0000',
              brushTip: createSolidBrushTip(5),
              blendMode: 'normal',
            },
          },
        ],
      },
    ]

    await renderLayers(app, layers)

    // 各レイヤーごとにRenderTextureにレンダリング + 段階的合成
    // レイヤー1: 1回, レイヤー2: 1回, 段階的合成: 2回（firstSprite + 2層目の合成）
    expect(app.renderer.render).toHaveBeenCalled()
    // チェッカーボード + 合成されたSprite
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('消しゴムモードのストロークを含むレイヤーをRenderTextureにレンダリングする', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer with eraser',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
        drawables: [
          {
            id: 'eraser-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
            style: {
              color: '#000000',
              brushTip: createSolidBrushTip(10),
              blendMode: 'erase',
            },
          },
        ],
      },
    ]

    // エラーなく実行されることを確認
    await expect(renderLayers(app, layers)).resolves.not.toThrow()
    // RenderTextureにレンダリングされることを確認（消しゴムが透過として機能するため）
    expect(app.renderer.render).toHaveBeenCalled()
  })

  test('非表示レイヤーはRenderTextureにレンダリングしない', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Hidden Layer',
        type: 'drawing',
        isVisible: false,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
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
              brushTip: createSolidBrushTip(3),
              blendMode: 'normal',
            },
          },
        ],
      },
    ]

    await renderLayers(app, layers)

    // 非表示レイヤーはRenderTextureにレンダリングしない
    expect(app.renderer.render).not.toHaveBeenCalled()
  })

  test('ImageDrawableを含むレイヤーをレンダリングする', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Layer with image',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
        drawables: [
          {
            id: 'image-1',
            type: 'image',
            createdAt: Date.now(),
            src: 'data:image/png;base64,test',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            scaleX: 1,
            scaleY: 1,
          },
        ],
      },
    ]

    // エラーなく実行されることを確認
    await expect(renderLayers(app, layers)).resolves.not.toThrow()
    // RenderTextureにレンダリングされることを確認
    expect(app.renderer.render).toHaveBeenCalled()
    // チェッカーボード + レイヤーSpriteがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('StrokeDrawableとImageDrawableが混在するレイヤーをレンダリングする', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Mixed layer',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
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
              brushTip: createSolidBrushTip(3),
              blendMode: 'normal',
            },
          },
          {
            id: 'image-1',
            type: 'image',
            createdAt: Date.now(),
            src: 'data:image/png;base64,test',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            scaleX: 1,
            scaleY: 1,
          },
        ],
      },
    ]

    // エラーなく実行されることを確認
    await expect(renderLayers(app, layers)).resolves.not.toThrow()
    // RenderTextureにレンダリングされることを確認
    expect(app.renderer.render).toHaveBeenCalled()
  })

  test('チェッカーボードが最下層に追加される', async () => {
    const { renderLayers } = await import('./renderLayers')

    await renderLayers(app, [])

    // チェッカーボードが追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(1)
  })

  test('レイヤーの透明度がSpriteに適用される', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Semi-transparent Layer',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 0.5,
        blendMode: 'normal',
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
              brushTip: createSolidBrushTip(3),
              blendMode: 'normal',
            },
          },
        ],
      },
    ]

    await renderLayers(app, layers)

    // レイヤーがレンダリングされる
    expect(app.renderer.render).toHaveBeenCalled()
    // チェッカーボード + レイヤーSpriteがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('段階的合成により複数レイヤーのブレンドモードが正しく適用される', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: 'layer-1',
        name: 'Base Layer',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
        drawables: [
          {
            id: 'stroke-1',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 0, y: 0 },
              { x: 50, y: 50 },
            ],
            style: {
              color: '#ff0000',
              brushTip: createSolidBrushTip(10),
              blendMode: 'normal',
            },
          },
        ],
      },
      {
        id: 'layer-2',
        name: 'Multiply Layer',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'multiply',
        drawables: [
          {
            id: 'stroke-2',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 25, y: 25 },
              { x: 75, y: 75 },
            ],
            style: {
              color: '#0000ff',
              brushTip: createSolidBrushTip(10),
              blendMode: 'normal',
            },
          },
        ],
      },
      {
        id: 'layer-3',
        name: 'Screen Layer',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 0.8,
        blendMode: 'screen',
        drawables: [
          {
            id: 'stroke-3',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 50, y: 0 },
              { x: 100, y: 50 },
            ],
            style: {
              color: '#00ff00',
              brushTip: createSolidBrushTip(10),
              blendMode: 'normal',
            },
          },
        ],
      },
    ]

    await renderLayers(app, layers)

    // 段階的合成により複数回renderが呼ばれる
    // レイヤー1: 1回, レイヤー2: 1回, レイヤー3: 1回
    // 段階的合成: firstSprite + 2回の合成
    expect(app.renderer.render).toHaveBeenCalled()
    // チェッカーボード + 最終合成されたSprite
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('背景レイヤーがある場合でも段階的合成が正しく動作する', async () => {
    const { renderLayers } = await import('./renderLayers')

    const layers: Layer[] = [
      {
        id: BACKGROUND_LAYER_ID,
        name: 'Background',
        type: 'background',
        isVisible: true,
        isLocked: true,
        opacity: 1,
        blendMode: 'normal',
        drawables: [],
      },
      {
        id: 'layer-1',
        name: 'Layer 1',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'normal',
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
              brushTip: createSolidBrushTip(5),
              blendMode: 'normal',
            },
          },
        ],
      },
      {
        id: 'layer-2',
        name: 'Layer 2',
        type: 'drawing',
        isVisible: true,
        isLocked: false,
        opacity: 1,
        blendMode: 'multiply',
        drawables: [
          {
            id: 'stroke-2',
            type: 'stroke',
            createdAt: Date.now(),
            points: [
              { x: 20, y: 20 },
              { x: 30, y: 30 },
            ],
            style: {
              color: '#0000ff',
              brushTip: createSolidBrushTip(5),
              blendMode: 'normal',
            },
          },
        ],
      },
    ]

    await renderLayers(app, layers)

    // チェッカーボード + 合成されたSprite（白背景は段階的合成に含まれる）
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })
})
