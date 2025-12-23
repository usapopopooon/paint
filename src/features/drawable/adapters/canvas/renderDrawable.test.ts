import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderDrawable } from './renderDrawable'
import type { StrokeDrawable } from '../../types'
import { createSolidBrushTip } from '@/features/brush'

// モックキャンバスコンテキスト
const createMockContext = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
  globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
  globalAlpha: 1,
})

describe('renderDrawable', () => {
  let ctx: ReturnType<typeof createMockContext>

  beforeEach(() => {
    ctx = createMockContext()
  })

  describe('stroke rendering', () => {
    test('2点以上のストロークをレンダリングする', () => {
      const stroke: StrokeDrawable = {
        id: 'test-1',
        type: 'stroke',
        createdAt: Date.now(),
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
        style: {
          color: '#ff0000',
          brushTip: createSolidBrushTip(5),
          blendMode: 'normal',
        },
      }

      renderDrawable(ctx as unknown as CanvasRenderingContext2D, stroke)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
      expect(ctx.lineTo).toHaveBeenCalledWith(100, 100)
      expect(ctx.stroke).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
      expect(ctx.strokeStyle).toBe('#ff0000')
      expect(ctx.lineWidth).toBe(5)
      expect(ctx.lineCap).toBe('round')
      expect(ctx.lineJoin).toBe('round')
    })

    test('1点のみのストロークはレンダリングしない', () => {
      const stroke: StrokeDrawable = {
        id: 'test-2',
        type: 'stroke',
        createdAt: Date.now(),
        points: [{ x: 0, y: 0 }],
        style: {
          color: '#000000',
          brushTip: createSolidBrushTip(3),
          blendMode: 'normal',
        },
      }

      renderDrawable(ctx as unknown as CanvasRenderingContext2D, stroke)

      expect(ctx.beginPath).not.toHaveBeenCalled()
      expect(ctx.stroke).not.toHaveBeenCalled()
    })

    test('空のポイント配列はレンダリングしない', () => {
      const stroke: StrokeDrawable = {
        id: 'test-3',
        type: 'stroke',
        createdAt: Date.now(),
        points: [],
        style: {
          color: '#000000',
          brushTip: createSolidBrushTip(3),
          blendMode: 'normal',
        },
      }

      renderDrawable(ctx as unknown as CanvasRenderingContext2D, stroke)

      expect(ctx.beginPath).not.toHaveBeenCalled()
    })

    test('複数ポイントのストロークを正しくレンダリングする', () => {
      const stroke: StrokeDrawable = {
        id: 'test-4',
        type: 'stroke',
        createdAt: Date.now(),
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 50 },
          { x: 100, y: 0 },
          { x: 150, y: 50 },
        ],
        style: {
          color: '#00ff00',
          brushTip: createSolidBrushTip(10),
          blendMode: 'normal',
        },
      }

      renderDrawable(ctx as unknown as CanvasRenderingContext2D, stroke)

      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
      expect(ctx.lineTo).toHaveBeenCalledTimes(3)
      expect(ctx.lineTo).toHaveBeenNthCalledWith(1, 50, 50)
      expect(ctx.lineTo).toHaveBeenNthCalledWith(2, 100, 0)
      expect(ctx.lineTo).toHaveBeenNthCalledWith(3, 150, 50)
    })

    test('eraseブレンドモードでdestination-outを設定する', () => {
      const stroke: StrokeDrawable = {
        id: 'test-5',
        type: 'stroke',
        createdAt: Date.now(),
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
        style: {
          color: 'transparent',
          brushTip: createSolidBrushTip(20),
          blendMode: 'erase',
        },
      }

      renderDrawable(ctx as unknown as CanvasRenderingContext2D, stroke)

      expect(ctx.globalCompositeOperation).toBe('destination-out')
      expect(ctx.strokeStyle).toBe('rgba(0,0,0,1)')
    })

    test('normalブレンドモードでは指定色を使用する', () => {
      const stroke: StrokeDrawable = {
        id: 'test-6',
        type: 'stroke',
        createdAt: Date.now(),
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
        style: {
          color: '#0000ff',
          brushTip: createSolidBrushTip(8),
          blendMode: 'normal',
        },
      }

      renderDrawable(ctx as unknown as CanvasRenderingContext2D, stroke)

      expect(ctx.strokeStyle).toBe('#0000ff')
      // globalCompositeOperationはデフォルトのまま変更されない
    })

    test('ブラシチップのopacityがglobalAlphaに設定される', () => {
      const stroke: StrokeDrawable = {
        id: 'test-7',
        type: 'stroke',
        createdAt: Date.now(),
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
        style: {
          color: '#ff0000',
          brushTip: {
            type: 'solid',
            size: 5,
            hardness: 1,
            opacity: 0.5,
          },
          blendMode: 'normal',
        },
      }

      renderDrawable(ctx as unknown as CanvasRenderingContext2D, stroke)

      expect(ctx.globalAlpha).toBe(0.5)
    })
  })
})
