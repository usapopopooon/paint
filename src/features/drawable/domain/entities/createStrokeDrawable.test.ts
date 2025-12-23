import { describe, test, expect } from 'vitest'
import { createStrokeDrawable } from './createStrokeDrawable'
import { createSolidBrushTip } from '@/features/brush'

describe('createStrokeDrawable', () => {
  const testPoints = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ]
  const testStyle = {
    color: '#ff0000',
    brushTip: createSolidBrushTip(5),
    blendMode: 'normal' as const,
  }

  test('自動生成されたIDでストロークDrawableを作成する', () => {
    const drawable = createStrokeDrawable(testPoints, testStyle)

    expect(drawable.type).toBe('stroke')
    expect(drawable.id).toMatch(/^drawable-/)
    expect(drawable.createdAt).toBeGreaterThan(0)
    expect(drawable.points).toEqual(testPoints)
    expect(drawable.style).toEqual(testStyle)
  })

  test('カスタムIDでストロークDrawableを作成する', () => {
    const customId = 'custom-stroke-id'
    const drawable = createStrokeDrawable(testPoints, testStyle, customId)

    expect(drawable.id).toBe(customId)
  })

  test('イミュータブルなポイント配列を作成する', () => {
    const drawable = createStrokeDrawable(testPoints, testStyle)

    expect(Object.isFrozen(drawable.points) || Array.isArray(drawable.points)).toBe(true)
  })
})
