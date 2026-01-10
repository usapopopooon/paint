import { describe, expect, test } from 'vitest'
import {
  flipDrawableHorizontal,
  flipDrawablesHorizontal,
  flipDrawableVertical,
  flipDrawablesVertical,
} from './flipDrawable'
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
    test('ストロークの座標を水平方向に反転する', () => {
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

    test('Y座標は変更されない', () => {
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

    test('キャンバス中央の座標は反転後も同じ位置', () => {
      const canvasWidth = 800
      const stroke = createTestStroke([{ x: 400, y: 100 }])

      const flipped = flipDrawableHorizontal(stroke, canvasWidth) as StrokeDrawable

      expect(flipped.points[0]?.x).toBe(400)
    })

    test('元のDrawableを変更しない（イミュータブル）', () => {
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

    test('キャンバス端の座標が正しく反転される', () => {
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

    test('ImageDrawableを水平方向に反転する', () => {
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

    test('ImageDrawableを2回反転すると元に戻る', () => {
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

    test('ImageDrawableのY座標とサイズは変更されない', () => {
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

  describe('flipDrawableVertical', () => {
    test('ストロークの座標を垂直方向に反転する', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      const flipped = flipDrawableVertical(stroke, 600) as StrokeDrawable

      expect(flipped.points).toEqual([
        { x: 100, y: 500 },
        { x: 200, y: 400 },
      ])
    })

    test('X座標は変更されない', () => {
      const stroke = createTestStroke([
        { x: 50, y: 100 },
        { x: 150, y: 200 },
        { x: 250, y: 300 },
      ])

      const flipped = flipDrawableVertical(stroke, 400) as StrokeDrawable

      expect(flipped.points[0]?.x).toBe(50)
      expect(flipped.points[1]?.x).toBe(150)
      expect(flipped.points[2]?.x).toBe(250)
    })

    test('キャンバス中央の座標は反転後も同じ位置', () => {
      const canvasHeight = 600
      const stroke = createTestStroke([{ x: 100, y: 300 }])

      const flipped = flipDrawableVertical(stroke, canvasHeight) as StrokeDrawable

      expect(flipped.points[0]?.y).toBe(300)
    })

    test('元のDrawableを変更しない（イミュータブル）', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      flipDrawableVertical(stroke, 600)

      expect(stroke.points).toEqual([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])
    })

    test('キャンバス端の座標が正しく反転される', () => {
      const stroke = createTestStroke([
        { x: 100, y: 0 },
        { x: 200, y: 600 },
      ])

      const flipped = flipDrawableVertical(stroke, 600) as StrokeDrawable

      expect(flipped.points).toEqual([
        { x: 100, y: 600 },
        { x: 200, y: 0 },
      ])
    })

    test('ImageDrawableを垂直方向に反転する', () => {
      const image = createImageDrawable({
        src: 'data:image/png;base64,test',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      })

      const flipped = flipDrawableVertical(image, 600) as ImageDrawable

      // y = canvasHeight - y - height = 600 - 100 - 150 = 350
      expect(flipped.x).toBe(100)
      expect(flipped.y).toBe(350)
      expect(flipped.width).toBe(200)
      expect(flipped.height).toBe(150)
      // scaleYが反転される
      expect(flipped.scaleY).toBe(-1)
    })

    test('ImageDrawableを2回反転すると元に戻る', () => {
      const image = createImageDrawable({
        src: 'data:image/png;base64,test',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      })

      const flippedOnce = flipDrawableVertical(image, 600) as ImageDrawable
      const flippedTwice = flipDrawableVertical(flippedOnce, 600) as ImageDrawable

      expect(flippedTwice.y).toBe(100)
      expect(flippedTwice.scaleY).toBe(1)
    })

    test('ImageDrawableのX座標とサイズは変更されない', () => {
      const image = createImageDrawable({
        src: 'data:image/png;base64,test',
        x: 50,
        y: 0,
        width: 300,
        height: 200,
      })

      const flipped = flipDrawableVertical(image, 600) as ImageDrawable

      expect(flipped.x).toBe(50)
      expect(flipped.width).toBe(300)
      expect(flipped.height).toBe(200)
    })
  })

  describe('flipDrawablesHorizontal', () => {
    test('複数のDrawableを水平方向に反転する', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])

      const flipped = flipDrawablesHorizontal([stroke1, stroke2], 800) as StrokeDrawable[]

      expect(flipped[0]?.points).toEqual([{ x: 700, y: 100 }])
      expect(flipped[1]?.points).toEqual([{ x: 600, y: 200 }])
    })

    test('空配列を処理できる', () => {
      const flipped = flipDrawablesHorizontal([], 800)

      expect(flipped).toEqual([])
    })

    test('元の配列を変更しない（イミュータブル）', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])
      const drawables = [stroke1, stroke2]

      flipDrawablesHorizontal(drawables, 800)

      expect(drawables[0]?.points).toEqual([{ x: 100, y: 100 }])
      expect(drawables[1]?.points).toEqual([{ x: 200, y: 200 }])
    })
  })

  describe('flipDrawablesVertical', () => {
    test('複数のDrawableを垂直方向に反転する', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])

      const flipped = flipDrawablesVertical([stroke1, stroke2], 600) as StrokeDrawable[]

      expect(flipped[0]?.points).toEqual([{ x: 100, y: 500 }])
      expect(flipped[1]?.points).toEqual([{ x: 200, y: 400 }])
    })

    test('空配列を処理できる', () => {
      const flipped = flipDrawablesVertical([], 600)

      expect(flipped).toEqual([])
    })

    test('元の配列を変更しない（イミュータブル）', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])
      const drawables = [stroke1, stroke2]

      flipDrawablesVertical(drawables, 600)

      expect(drawables[0]?.points).toEqual([{ x: 100, y: 100 }])
      expect(drawables[1]?.points).toEqual([{ x: 200, y: 200 }])
    })
  })
})
