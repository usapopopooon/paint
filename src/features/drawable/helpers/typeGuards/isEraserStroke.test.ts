import { describe, test, expect } from 'vitest'
import { isEraserStroke } from './isEraserStroke'
import { createStrokeDrawable } from '../../domain/entities/createStrokeDrawable'
import { createSolidBrushTip } from '@/features/brush'

describe('isEraserStroke', () => {
  test('消しゴムモードのストロークに対してtrueを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'erase',
    })

    expect(isEraserStroke(drawable)).toBe(true)
  })

  test('通常モードのストロークに対してfalseを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    })

    expect(isEraserStroke(drawable)).toBe(false)
  })

  test('hardnessが設定された消しゴムストロークに対してtrueを返す', () => {
    const drawable = createStrokeDrawable([{ x: 0, y: 0 }], {
      color: 'transparent',
      brushTip: createSolidBrushTip(10, 1, 0.5),
      blendMode: 'erase',
    })

    expect(isEraserStroke(drawable)).toBe(true)
    // hardnessの値が正しく設定されていることも確認
    expect(drawable.style.brushTip.hardness).toBe(0.5)
  })
})
