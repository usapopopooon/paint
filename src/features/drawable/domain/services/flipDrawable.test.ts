import { describe, expect, it } from 'vitest'
import { flipDrawableHorizontal, flipDrawablesHorizontal } from './flipDrawable'
import { createStrokeDrawable, createImageDrawable } from '../entities'
import { createSolidBrushTip } from '@/features/brush'
import type { StrokeDrawable, ImageDrawable } from '../../types'

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

      const flipped = flipDrawableHorizontal(stroke, 800) as StrokeDrawable

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

      const flipped = flipDrawableHorizontal(stroke, 400) as StrokeDrawable

      expect(flipped.points[0]?.y).toBe(50)
      expect(flipped.points[1]?.y).toBe(150)
      expect(flipped.points[2]?.y).toBe(250)
    })

    it('キャンバス中央の座標は反転後も同じ位置', () => {
      const canvasWidth = 800
      const stroke = createTestStroke([{ x: 400, y: 100 }])

      const flipped = flipDrawableHorizontal(stroke, canvasWidth) as StrokeDrawable

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

      const flipped = flipDrawableHorizontal(stroke, 800) as StrokeDrawable

      expect(flipped.points).toEqual([
        { x: 800, y: 100 },
        { x: 0, y: 200 },
      ])
    })

    it('ImageDrawableを水平方向に反転する', () => {
      const image = createImageDrawable({
        src: 'data:image/png;base64,test',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      })

      const flipped = flipDrawableHorizontal(image, 800) as ImageDrawable

      // x = canvasWidth - x - width = 800 - 100 - 200 = 500
      expect(flipped.x).toBe(500)
      expect(flipped.y).toBe(100)
      expect(flipped.width).toBe(200)
      expect(flipped.height).toBe(150)
      // scaleXが反転される
      expect(flipped.scaleX).toBe(-1)
    })

    it('ImageDrawableを2回反転すると元に戻る', () => {
      const image = createImageDrawable({
        src: 'data:image/png;base64,test',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      })

      const flippedOnce = flipDrawableHorizontal(image, 800) as ImageDrawable
      const flippedTwice = flipDrawableHorizontal(flippedOnce, 800) as ImageDrawable

      expect(flippedTwice.x).toBe(100)
      expect(flippedTwice.scaleX).toBe(1)
    })

    it('ImageDrawableのY座標とサイズは変更されない', () => {
      const image = createImageDrawable({
        src: 'data:image/png;base64,test',
        x: 0,
        y: 50,
        width: 300,
        height: 200,
      })

      const flipped = flipDrawableHorizontal(image, 800) as ImageDrawable

      expect(flipped.y).toBe(50)
      expect(flipped.width).toBe(300)
      expect(flipped.height).toBe(200)
    })
  })

  describe('flipDrawablesHorizontal', () => {
    it('複数のDrawableを水平方向に反転する', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])

      const flipped = flipDrawablesHorizontal([stroke1, stroke2], 800) as StrokeDrawable[]

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
