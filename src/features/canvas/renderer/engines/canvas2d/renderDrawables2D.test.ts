import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { StrokeDrawable } from '@/features/drawable'
import { createSolidBrushTip } from '@/features/brush'

// renderDrawable2D をモック
vi.mock('./renderDrawable2D', () => ({
  renderDrawable2D: vi.fn(),
}))

describe('renderDrawables2D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('キャンバスをクリアする', async () => {
    const { renderDrawables2D } = await import('./renderDrawables2D')

    const mockCtx = {
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    await renderDrawables2D(mockCtx, [], 800, 600)

    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
  })

  test('空の描画要素配列でもエラーにならない', async () => {
    const { renderDrawables2D } = await import('./renderDrawables2D')

    const mockCtx = {
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    await expect(renderDrawables2D(mockCtx, [], 800, 600)).resolves.not.toThrow()
  })

  test('描画要素ごとにrenderDrawable2Dを呼び出す', async () => {
    const { renderDrawables2D } = await import('./renderDrawables2D')
    const { renderDrawable2D } = await import('./renderDrawable2D')

    const mockCtx = {
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D

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
    ]

    await renderDrawables2D(mockCtx, drawables, 800, 600)

    expect(renderDrawable2D).toHaveBeenCalledTimes(2)
    expect(renderDrawable2D).toHaveBeenCalledWith(mockCtx, drawables[0])
    expect(renderDrawable2D).toHaveBeenCalledWith(mockCtx, drawables[1])
  })
})
