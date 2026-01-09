import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { StrokeDrawable } from '@/features/drawable'
import { createSolidBrushTip } from '@/features/brush'

// renderStroke2D をモック
vi.mock('./renderStroke2D', () => ({
  renderStroke2D: vi.fn(),
}))

describe('renderDrawable2D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('ストローク描画要素でrenderStroke2Dを呼び出す', async () => {
    const { renderDrawable2D } = await import('./renderDrawable2D')
    const { renderStroke2D } = await import('./renderStroke2D')

    const ctx = {} as CanvasRenderingContext2D

    const stroke: StrokeDrawable = {
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
    }

    await renderDrawable2D(ctx, stroke)

    expect(renderStroke2D).toHaveBeenCalledWith(ctx, stroke)
  })

  // 画像描画のテストはjsdom環境ではImage.onloadが動作しないためスキップ
  // 実際の動作はStorybookやE2Eテストで確認する
})

describe('clearImageCache2D', () => {
  test('キャッシュをクリアしてもエラーにならない', async () => {
    const { clearImageCache2D } = await import('./renderDrawable2D')

    expect(() => clearImageCache2D()).not.toThrow()
  })
})
