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
  }

  return {
    stage: mockStage,
    renderer: mockRenderer,
  } as unknown as Application
}

describe('renderDrawables', () => {
  let app: ReturnType<typeof createMockApp>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    app = createMockApp()
  })

  test('ステージをクリアして背景色を設定する', async () => {
    const { renderDrawables } = await import('./renderDrawables')

    renderDrawables(app, [], '#ff0000')

    expect(app.stage.removeChildren).toHaveBeenCalled()
    expect(app.renderer.background.color).toBe('#ff0000')
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

  test('描画要素がある場合にGraphicsを作成してコンテナに追加する', async () => {
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

    // ステージにコンテナが追加されていることを確認
    expect(app.stage.addChild).toHaveBeenCalled()
  })

  test('消しゴムモードのストロークを処理する', async () => {
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
  })
})
