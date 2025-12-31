import { describe, test, expect } from 'vitest'
import { isImageDrawable } from './isImageDrawable'
import { createImageDrawable } from '../../domain/entities/createImageDrawable'
import { createStrokeDrawable } from '../../domain/entities/createStrokeDrawable'
import { createSolidBrushTip } from '@/features/brush'

describe('isImageDrawable', () => {
  test('ImageDrawableに対してtrueを返す', () => {
    const drawable = createImageDrawable({
      src: 'data:image/png;base64,test',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })

    expect(isImageDrawable(drawable)).toBe(true)
  })

  test('StrokeDrawableに対してfalseを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    })

    expect(isImageDrawable(drawable)).toBe(false)
  })

  test('型を正しく絞り込む', () => {
    const drawable = createImageDrawable({
      src: 'data:image/png;base64,test',
      x: 10,
      y: 20,
      width: 100,
      height: 200,
    })

    if (isImageDrawable(drawable)) {
      // TypeScriptは画像固有のプロパティへのアクセスを許可するべき
      expect(drawable.src).toBeDefined()
      expect(drawable.x).toBe(10)
      expect(drawable.y).toBe(20)
      expect(drawable.width).toBe(100)
      expect(drawable.height).toBe(200)
    }
  })
})
