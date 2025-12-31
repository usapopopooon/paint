import { describe, test, expect } from 'vitest'
import { createImageDrawable } from './createImageDrawable'

describe('createImageDrawable', () => {
  const testParams = {
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
    x: 100,
    y: 200,
    width: 400,
    height: 300,
  }

  test('自動生成されたIDで画像Drawableを作成する', () => {
    const drawable = createImageDrawable(testParams)

    expect(drawable.type).toBe('image')
    expect(drawable.id).toMatch(/^drawable-/)
    expect(drawable.createdAt).toBeGreaterThan(0)
    expect(drawable.src).toBe(testParams.src)
    expect(drawable.x).toBe(testParams.x)
    expect(drawable.y).toBe(testParams.y)
    expect(drawable.width).toBe(testParams.width)
    expect(drawable.height).toBe(testParams.height)
    expect(drawable.scaleX).toBe(1)
  })

  test('カスタムIDで画像Drawableを作成する', () => {
    const customId = 'custom-image-id'
    const drawable = createImageDrawable(testParams, customId)

    expect(drawable.id).toBe(customId)
  })

  test('座標0でも正しく作成される', () => {
    const paramsWithZero = {
      ...testParams,
      x: 0,
      y: 0,
    }

    const drawable = createImageDrawable(paramsWithZero)

    expect(drawable.x).toBe(0)
    expect(drawable.y).toBe(0)
  })

  test('各呼び出しでユニークなIDが生成される', () => {
    const drawable1 = createImageDrawable(testParams)
    const drawable2 = createImageDrawable(testParams)

    expect(drawable1.id).not.toBe(drawable2.id)
  })

  test('createdAtは現在時刻に近い', () => {
    const before = Date.now()
    const drawable = createImageDrawable(testParams)
    const after = Date.now()

    expect(drawable.createdAt).toBeGreaterThanOrEqual(before)
    expect(drawable.createdAt).toBeLessThanOrEqual(after)
  })

  test('scaleXを指定できる', () => {
    const drawable = createImageDrawable({ ...testParams, scaleX: -1 })

    expect(drawable.scaleX).toBe(-1)
  })
})
