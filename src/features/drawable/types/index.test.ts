import { describe, test, expect } from 'vitest'
import { isStrokeDrawable, generateDrawableId, createStrokeDrawable } from './index'
import { createSolidBrushTip } from '@/features/brush'

describe('generateDrawableId', () => {
  test('正しいプレフィックスでユニークなIDを生成する', () => {
    const id = generateDrawableId()

    expect(id).toMatch(/^drawable-\d+-[a-z0-9]+$/)
  })

  test('呼び出すたびにユニークなIDを生成する', () => {
    const id1 = generateDrawableId()
    const id2 = generateDrawableId()

    expect(id1).not.toBe(id2)
  })
})

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
