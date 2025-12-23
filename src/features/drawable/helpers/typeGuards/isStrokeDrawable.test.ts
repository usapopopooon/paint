import { describe, test, expect } from 'vitest'
import { isStrokeDrawable } from './isStrokeDrawable'
import { createStrokeDrawable } from '../../domain/entities/createStrokeDrawable'
import { createSolidBrushTip } from '@/features/brush'

describe('isStrokeDrawable', () => {
  test('ストロークDrawableに対してtrueを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    })

    expect(isStrokeDrawable(drawable)).toBe(true)
  })

  test('型を正しく絞り込む', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    })

    if (isStrokeDrawable(drawable)) {
      // TypeScriptはストローク固有のプロパティへのアクセスを許可するべき
      expect(drawable.points).toBeDefined()
      expect(drawable.style).toBeDefined()
    }
  })
})
