import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { Application } from 'pixi.js'
import type { StrokeDrawable } from '@/features/drawable'
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

describe('renderDrawables', () => {
  let app: ReturnType<typeof createMockApp>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    app = createMockApp()
  })

  test('ステージをクリアしてコンテナと背景を追加する', async () => {
    const { renderDrawables } = await import('./renderDrawables')

    renderDrawables(app, [], '#ff0000')

    expect(app.stage.removeChildren).toHaveBeenCalled()
    expect(app.stage.addChild).toHaveBeenCalled()
  })

  test('コンテナをステージに追加する', async () => {
    const { renderDrawables } = await import('./renderDrawables')

    renderDrawables(app, [], '#ffffff')

    expect(app.stage.addChild).toHaveBeenCalled()
  })

  test('空の描画要素配列でもエラーにならない', async () => {
    const { renderDrawables } = await import('./renderDrawables')

    expect(() => renderDrawables(app, [], '#ffffff')).not.toThrow()
  })

  test('描画要素がある場合にRenderTextureにレンダリングしてSpriteをステージに追加する', async () => {
    const { renderDrawables } = await import('./renderDrawables')

    const drawables: StrokeDrawable[] = [
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
    ]

    renderDrawables(app, drawables, '#ffffff')

    // RenderTextureにレンダリングされることを確認
    expect(app.renderer.render).toHaveBeenCalled()
    // 背景 + レイヤーSpriteがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(2)
  })

  test('空の描画要素配列の場合はRenderTextureにレンダリングしない', async () => {
    const { renderDrawables } = await import('./renderDrawables')

    renderDrawables(app, [], '#ffffff')

    // 描画要素がない場合はRenderTextureにレンダリングしない
    expect(app.renderer.render).not.toHaveBeenCalled()
    // 背景のみがステージに追加される
    expect(app.stage.addChild).toHaveBeenCalledTimes(1)
  })

  test('消しゴムモードのストロークをRenderTextureにレンダリングする', async () => {
    const { renderDrawables } = await import('./renderDrawables')

    const eraserStroke: StrokeDrawable = {
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
    }

    // エラーなく実行されることを確認
    expect(() => renderDrawables(app, [eraserStroke], '#ffffff')).not.toThrow()
    // RenderTextureにレンダリングされることを確認（消しゴムが透過として機能するため）
    expect(app.renderer.render).toHaveBeenCalled()
  })
})
