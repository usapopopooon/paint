import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { Application } from 'pixi.js'
import type { Layer } from '@/features/layer'
import { BACKGROUND_LAYER_ID } from '@/features/layer'
import { createSolidBrushTip } from '@/features/brush'

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

    renderLayers(app, [])

    expect(app.stage.removeChildren).toHaveBeenCalled()
  })

  test('空のレイヤー配列でもエラーにならない', async () => {
    const { renderLayers } = await import('./renderLayers')

    expect(() => renderLayers(app, [])).not.toThrow()
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

    renderLayers(app, layers)

    // 背景がステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(1)
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

    renderLayers(app, layers)

    // 背景は追加されない
    expect(app.stage.addChild).not.toHaveBeenCalled()
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

    renderLayers(app, layers)

    // 非表示レイヤーはスキップ
    expect(app.stage.addChild).not.toHaveBeenCalled()
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

    renderLayers(app, layers)

    // 空レイヤーはスキップ
    expect(app.stage.addChild).not.toHaveBeenCalled()
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

    renderLayers(app, layers)

    // RenderTextureにレンダリングされることを確認
    expect(app.renderer.render).toHaveBeenCalled()
    // レイヤーSpriteがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(1)
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

    renderLayers(app, layers)

    // 各レイヤーごとにRenderTextureにレンダリングされる
    expect(app.renderer.render).toHaveBeenCalledTimes(2)
    // 2つのレイヤーSpriteがステージに追加される
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
    expect(() => renderLayers(app, layers)).not.toThrow()
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

    renderLayers(app, layers)

    // 非表示レイヤーはRenderTextureにレンダリングしない
    expect(app.renderer.render).not.toHaveBeenCalled()
  })
})
