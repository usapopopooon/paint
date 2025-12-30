import { describe, expect, it } from 'vitest'
import { translateDrawable, translateDrawables } from './translateDrawable'
import { createStrokeDrawable } from '../entities'
import { createSolidBrushTip } from '@/features/brush'

describe('translateDrawable', () => {
  const createTestStroke = (points: { x: number; y: number }[]) =>
    createStrokeDrawable(points, {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    })

  describe('translateDrawable', () => {
    it('ストロークの座標をオフセット分移動する', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      const translated = translateDrawable(stroke, 50, 25)

      expect(translated.points).toEqual([
        { x: 150, y: 125 },
        { x: 250, y: 225 },
      ])
    })

    it('負のオフセットで座標を移動する', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      const translated = translateDrawable(stroke, -30, -20)

      expect(translated.points).toEqual([
        { x: 70, y: 80 },
        { x: 170, y: 180 },
      ])
    })

    it('オフセット0の場合は座標が変わらない', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      const translated = translateDrawable(stroke, 0, 0)

      expect(translated.points).toEqual([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])
    })

    it('元のDrawableを変更しない（イミュータブル）', () => {
      const stroke = createTestStroke([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])

      translateDrawable(stroke, 50, 25)

      expect(stroke.points).toEqual([
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ])
    })
  })

  describe('translateDrawables', () => {
    it('複数のDrawableの座標をオフセット分移動する', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])

      const translated = translateDrawables([stroke1, stroke2], 10, 20)

      expect(translated[0]?.points).toEqual([{ x: 110, y: 120 }])
      expect(translated[1]?.points).toEqual([{ x: 210, y: 220 }])
    })

    it('オフセット0の場合は元の配列を返す', () => {
      const stroke1 = createTestStroke([{ x: 100, y: 100 }])
      const stroke2 = createTestStroke([{ x: 200, y: 200 }])
      const drawables = [stroke1, stroke2]

      const translated = translateDrawables(drawables, 0, 0)

      expect(translated).toBe(drawables)
    })

    it('空配列を処理できる', () => {
      const translated = translateDrawables([], 10, 20)

      expect(translated).toEqual([])
    })
  })
})
