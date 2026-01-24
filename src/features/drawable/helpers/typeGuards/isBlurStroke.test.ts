import { describe, test, expect } from 'vitest'
import { isBlurStroke } from './isBlurStroke'
import { createStrokeDrawable } from '../../domain/entities/createStrokeDrawable'
import { createSolidBrushTip } from '@/features/brush'

describe('isBlurStroke', () => {
  test('ぼかしモードのストロークに対してtrueを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: 'transparent',
      brushTip: createSolidBrushTip(10, 1, 0.5),
      blendMode: 'blur',
    })

    expect(isBlurStroke(drawable)).toBe(true)
  })

  test('通常モードのストロークに対してfalseを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: '#ff0000',
      brushTip: createSolidBrushTip(10),
      blendMode: 'normal',
    })

    expect(isBlurStroke(drawable)).toBe(false)
  })

  test('消しゴムモードのストロークに対してfalseを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: '#000000',
      brushTip: createSolidBrushTip(10),
      blendMode: 'erase',
    })

    expect(isBlurStroke(drawable)).toBe(false)
  })
})
