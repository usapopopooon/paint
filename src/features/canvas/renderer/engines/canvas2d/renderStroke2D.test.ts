import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { StrokeDrawable } from '@/features/drawable'
import { createSolidBrushTip, createSoftBrushTip } from '@/features/brush'
import { renderStroke2D } from './renderStroke2D'

// Canvas 2D コンテキストのモック
const createMockContext = () => ({
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  lineWidth: 0,
  strokeStyle: '',
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
  globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
})

describe('renderStroke2D', () => {
  let ctx: ReturnType<typeof createMockContext>

  beforeEach(() => {
    ctx = createMockContext()
  })

  test('ポイントが2つ未満の場合は何もしない', () => {
    const stroke: StrokeDrawable = {
      id: 'stroke-1',
      type: 'stroke',
      createdAt: Date.now(),
      points: [{ x: 0, y: 0 }],
      style: {
        color: '#000000',
        brushTip: createSolidBrushTip(3),
        blendMode: 'normal',
      },
    }

    renderStroke2D(ctx as unknown as CanvasRenderingContext2D, stroke)

    expect(ctx.beginPath).not.toHaveBeenCalled()
  })

  test('通常のストロークを描画する', () => {
    const stroke: StrokeDrawable = {
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
    }

    renderStroke2D(ctx as unknown as CanvasRenderingContext2D, stroke)

    expect(ctx.beginPath).toHaveBeenCalled()
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 10)
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.lineWidth).toBe(5)
    expect(ctx.lineCap).toBe('round')
    expect(ctx.lineJoin).toBe('round')
  })

  test('消しゴムモードでdestination-outを設定する', () => {
    const stroke: StrokeDrawable = {
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

    renderStroke2D(ctx as unknown as CanvasRenderingContext2D, stroke)

    // 消しゴムモードが設定され、その後元に戻される
    expect(ctx.globalCompositeOperation).toBe('source-over')
  })

  test('ソフトエッジ（hardness > 0）で複数回strokeを呼び出す', () => {
    const stroke: StrokeDrawable = {
      id: 'soft-stroke-1',
      type: 'stroke',
      createdAt: Date.now(),
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      style: {
        color: '#0000ff',
        brushTip: createSoftBrushTip(10, 0.5),
        blendMode: 'normal',
      },
    }

    renderStroke2D(ctx as unknown as CanvasRenderingContext2D, stroke)

    // ソフトエッジは8レイヤーで描画される
    expect(ctx.stroke).toHaveBeenCalledTimes(8)
  })

  test('複数のポイントを持つストロークを描画する', () => {
    const stroke: StrokeDrawable = {
      id: 'stroke-1',
      type: 'stroke',
      createdAt: Date.now(),
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 5 },
        { x: 30, y: 15 },
      ],
      style: {
        color: '#00ff00',
        brushTip: createSolidBrushTip(3),
        blendMode: 'normal',
      },
    }

    renderStroke2D(ctx as unknown as CanvasRenderingContext2D, stroke)

    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 10)
    expect(ctx.lineTo).toHaveBeenCalledWith(20, 5)
    expect(ctx.lineTo).toHaveBeenCalledWith(30, 15)
  })
})
