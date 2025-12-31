import { describe, expect, it } from 'vitest'
import { flipDrawableHorizontal, flipDrawablesHorizontal } from './flipDrawable'
import { createStrokeDrawable } from '../entities'
import { createSolidBrushTip } from '@/features/brush'

describe('flipDrawable', () => {
  const createTestStroke = (points: { x: number; y: number }[]) =>
    createStrokeDrawable(points, {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    })

  describe('flipDrawableHorizontal', () => {
    it('ストロークの座標を水平方向に反転する', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      const flipped = flipDrawableHorizontal(stroke, 800)

      expect(flipped.points).toEqual([
        { x: 700, y: 100 },
        { x: 600, y: 200 },
      ])
    })

    it('Y座標は変更されない', () => {
      const stroke = createTestStroke([
        { x: 100, y: 50 },
        { x: 200, y: 150 },
        { x: 300, y: 250 },
      ])

      const flipped = flipDrawableHorizontal(stroke, 400)

      expect(flipped.points[0]?.y).toBe(50)
      expect(flipped.points[1]?.y).toBe(150)
      expect(flipped.points[2]?.y).toBe(250)
    })

    it('キャンバス中央の座標は反転後も同じ位置', () => {
      const canvasWidth = 800
      const stroke = createTestStroke([{ x: 400, y: 100 }])

      const flipped = flipDrawableHorizontal(stroke, canvasWidth)

      expect(flipped.points[0]?.x).toBe(400)
    })

    it('元のDrawableを変更しない（イミュータブル）', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      flipDrawableHorizontal(stroke, 800)

      expect(stroke.points).toEqual([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])
    })

    it('キャンバス端の座標が正しく反転される', () => {
      const stroke = createTestStroke([
        { x: 0, y: 100 },
        { x: 800, y: 200 },
      ])

      const flipped = flipDrawableHorizontal(stroke, 800)

      expect(flipped.points).toEqual([
        { x: 800, y: 100 },
        { x: 0, y: 200 },
      ])
    })
  })

  describe('flipDrawablesHorizontal', () => {
    it('複数のDrawableを水平方向に反転する', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])

      const flipped = flipDrawablesHorizontal([stroke1, stroke2], 800)

      expect(flipped[0]?.points).toEqual([{ x: 700, y: 100 }])
      expect(flipped[1]?.points).toEqual([{ x: 600, y: 200 }])
    })

    it('空配列を処理できる', () => {
      const flipped = flipDrawablesHorizontal([], 800)

      expect(flipped).toEqual([])
    })

    it('元の配列を変更しない（イミュータブル）', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])
      const drawables = [stroke1, stroke2]

      flipDrawablesHorizontal(drawables, 800)

      expect(drawables[0]?.points).toEqual([{ x: 100, y: 100 }])
      expect(drawables[1]?.points).toEqual([{ x: 200, y: 200 }])
    })
  })
})
