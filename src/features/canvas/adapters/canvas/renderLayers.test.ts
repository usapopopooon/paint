import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { Application } from 'pixi.js'
import type { Layer } from '@/features/layer'
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

  test('ステージをクリアして背景を追加する', async () => {
    const { renderLayers } = await import('./renderLayers')

    renderLayers(app, [], '#00ff00')

    expect(app.stage.removeChildren).toHaveBeenCalled()
    // 背景がステージに追加される
    expect(app.stage.addChild).toHaveBeenCalled()
  })

  test('空のレイヤー配列でもエラーにならない', async () => {
    const { renderLayers } = await import('./renderLayers')

    expect(() => renderLayers(app, [], '#ffffff')).not.toThrow()
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

    renderLayers(app, layers, '#ffffff')

    // 背景のみがステージに追加される（非表示レイヤーはスキップ）
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

    renderLayers(app, layers, '#ffffff')

    // 背景のみがステージに追加される（空レイヤーはスキップ）
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

    renderLayers(app, layers, '#ffffff')

    // RenderTextureにレンダリングされることを確認
    expect(app.renderer.render).toHaveBeenCalled()
    // 背景 + レイヤーSpriteがステージに追加される
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

    renderLayers(app, layers, '#ffffff')

    // 各レイヤーごとにRenderTextureにレンダリングされる
    expect(app.renderer.render).toHaveBeenCalledTimes(2)
    // 背景 + 2つのレイヤーSpriteがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(3)
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
    expect(() => renderLayers(app, layers, '#ffffff')).not.toThrow()
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

    renderLayers(app, layers, '#ffffff')

    // 非表示レイヤーはRenderTextureにレンダリングしない
    expect(app.renderer.render).not.toHaveBeenCalled()
  })
})
