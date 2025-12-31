import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Graphics } from 'pixi.js'
import { renderDrawable } from './renderDrawable'
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

describe('renderDrawable', () => {
  let graphics: Graphics

  beforeEach(() => {
    graphics = createMockGraphics()
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

      renderDrawable(graphics, stroke)

      expect(graphics.setStrokeStyle).toHaveBeenCalledWith({
        width: 5,
        color: '#ff0000',
        alpha: 1,
        cap: 'round',
        join: 'round',
      })
      expect(graphics.moveTo).toHaveBeenCalledWith(0, 0)
      expect(graphics.lineTo).toHaveBeenCalledWith(100, 100)
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

      renderDrawable(graphics, stroke)

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

      renderDrawable(graphics, stroke)

      expect(graphics.setStrokeStyle).not.toHaveBeenCalled()
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

      renderDrawable(graphics, stroke)

      expect(graphics.moveTo).toHaveBeenCalledWith(0, 0)
      expect(graphics.lineTo).toHaveBeenCalledTimes(3)
      expect(graphics.lineTo).toHaveBeenNthCalledWith(1, 50, 50)
      expect(graphics.lineTo).toHaveBeenNthCalledWith(2, 100, 0)
      expect(graphics.lineTo).toHaveBeenNthCalledWith(3, 150, 50)
    })

    test('eraseブレンドモードでhardness=0の場合は単一ストロークで描画', () => {
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
          brushTip: {
            type: 'solid',
            size: 20,
            hardness: 0,
            opacity: 1,
          },
          blendMode: 'erase',
        },
      }

      renderDrawable(graphics, stroke)

      expect(graphics.setStrokeStyle).toHaveBeenCalledWith({
        width: 20,
        color: 0xffffff,
        alpha: 1,
        cap: 'round',
        join: 'round',
      })
      expect(graphics.stroke).toHaveBeenCalledTimes(1)
    })

    test('eraseブレンドモードでhardness>0の場合は複数レイヤーで描画', () => {
      const stroke: StrokeDrawable = {
        id: 'test-soft-eraser',
        type: 'stroke',
        createdAt: Date.now(),
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
        style: {
          color: 'transparent',
          brushTip: {
            type: 'solid',
            size: 20,
            hardness: 0.5,
            opacity: 1,
          },
          blendMode: 'erase',
        },
      }

      renderDrawable(graphics, stroke)

      // 8レイヤーで描画される（ソフトエッジ消しゴム）
      expect(graphics.stroke).toHaveBeenCalledTimes(8)
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

      renderDrawable(graphics, stroke)

      expect(graphics.setStrokeStyle).toHaveBeenCalledWith({
        width: 8,
        color: '#0000ff',
        alpha: 1,
        cap: 'round',
        join: 'round',
      })
    })

    test('ブラシチップのopacityがalphaに設定される', () => {
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

      renderDrawable(graphics, stroke)

      expect(graphics.setStrokeStyle).toHaveBeenCalledWith({
        width: 5,
        color: '#ff0000',
        alpha: 0.5,
        cap: 'round',
        join: 'round',
      })
    })
  })
})
