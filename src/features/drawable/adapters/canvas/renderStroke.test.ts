import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Graphics } from 'pixi.js'
import { renderStroke } from './renderStroke'
import type { StrokeDrawable } from '../../types'
import { createSolidBrushTip } from '@/features/brush'

// モックPixiJS Graphics
const createMockGraphics = () => {
  const graphics = {
    setStrokeStyle: vi.fn(),
    moveTo: vi.fn().mockReturnThis(),
    lineTo: vi.fn().mockReturnThis(),
    stroke: vi.fn(),
  }
  return graphics as unknown as Graphics
}

describe('renderStroke', () => {
  let graphics: Graphics

  beforeEach(() => {
    graphics = createMockGraphics()
  })

  test('2点以上のストロークをレンダリングする', () => {
    const stroke: StrokeDrawable = {
      id: 'test-1',
      type: 'stroke',
      createdAt: Date.now(),
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
      style: {
        color: '#ff0000',
        brushTip: createSolidBrushTip(5),
        blendMode: 'normal',
      },
    }

    renderStroke(graphics, stroke)

    expect(graphics.setStrokeStyle).toHaveBeenCalledWith({
      width: 5,
      color: '#ff0000',
      alpha: 1,
      cap: 'round',
      join: 'round',
    })
    expect(graphics.moveTo).toHaveBeenCalledWith(10, 20)
    expect(graphics.lineTo).toHaveBeenCalledWith(30, 40)
    expect(graphics.stroke).toHaveBeenCalled()
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

    renderStroke(graphics, stroke)

    expect(graphics.setStrokeStyle).not.toHaveBeenCalled()
    expect(graphics.stroke).not.toHaveBeenCalled()
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

    renderStroke(graphics, stroke)

    expect(graphics.setStrokeStyle).not.toHaveBeenCalled()
  })

  test('eraseブレンドモードでは描画した部分を透過にする', () => {
    const stroke: StrokeDrawable = {
      id: 'test-4',
      type: 'stroke',
      createdAt: Date.now(),
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
      style: {
        color: '#ffffff',
        brushTip: createSolidBrushTip(20),
        blendMode: 'erase',
      },
    }

    renderStroke(graphics, stroke)

    expect(graphics.setStrokeStyle).toHaveBeenCalledWith({
      width: 20,
      color: 0xffffff,
      alpha: 1,
      cap: 'round',
      join: 'round',
    })
  })

  test('ブラシチップのopacityがalphaに反映される', () => {
    const stroke: StrokeDrawable = {
      id: 'test-5',
      type: 'stroke',
      createdAt: Date.now(),
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
      ],
      style: {
        color: '#0000ff',
        brushTip: {
          type: 'solid',
          size: 10,
          hardness: 1,
          opacity: 0.7,
        },
        blendMode: 'normal',
      },
    }

    renderStroke(graphics, stroke)

    expect(graphics.setStrokeStyle).toHaveBeenCalledWith({
      width: 10,
      color: '#0000ff',
      alpha: 0.7,
      cap: 'round',
      join: 'round',
    })
  })

  test('複数ポイントで正しい順序でlineTo呼び出しされる', () => {
    const stroke: StrokeDrawable = {
      id: 'test-6',
      type: 'stroke',
      createdAt: Date.now(),
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ],
      style: {
        color: '#00ff00',
        brushTip: createSolidBrushTip(2),
        blendMode: 'normal',
      },
    }

    renderStroke(graphics, stroke)

    expect(graphics.moveTo).toHaveBeenCalledWith(0, 0)
    expect(graphics.lineTo).toHaveBeenCalledTimes(3)
    expect(graphics.lineTo).toHaveBeenNthCalledWith(1, 10, 10)
    expect(graphics.lineTo).toHaveBeenNthCalledWith(2, 20, 20)
    expect(graphics.lineTo).toHaveBeenNthCalledWith(3, 30, 30)
  })
})
