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
  }

  return {
    stage: mockStage,
    renderer: mockRenderer,
  } as unknown as Application
}

describe('renderLayers', () => {
  let app: ReturnType<typeof createMockApp>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    app = createMockApp()
  })

  test('ステージをクリアして背景色を設定する', async () => {
    const { renderLayers } = await import('./renderLayers')

    renderLayers(app, [], '#00ff00')

    expect(app.stage.removeChildren).toHaveBeenCalled()
    expect(app.renderer.background.color).toBe('#00ff00')
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

    // 非表示レイヤーはステージに追加されない
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

    renderLayers(app, layers, '#ffffff')

    // 空レイヤーはステージに追加されない
    expect(app.stage.addChild).not.toHaveBeenCalled()
  })

  test('表示レイヤーをステージに追加する', async () => {
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

    expect(app.stage.addChild).toHaveBeenCalled()
  })

  test('複数の表示レイヤーを処理する', async () => {
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

    // 2つのレイヤーがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('消しゴムモードのストロークを含むレイヤーを処理する', async () => {
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
  })
})
