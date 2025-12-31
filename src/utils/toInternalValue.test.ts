import { describe, test, expect } from 'vitest'
import { toInternalValue } from './toInternalValue'
import { toDisplayValue } from './toDisplayValue'
import { DISPLAY_MULTIPLIER } from '@/constants'

describe('toInternalValue', () => {
  test('UI表示値を内部値に変換する（2倍）', () => {
    expect(toInternalValue(50)).toBe(100)
    expect(toInternalValue(100)).toBe(200)
    expect(toInternalValue(800)).toBe(1600)
  })

  test('0は0を返す', () => {
    expect(toInternalValue(0)).toBe(0)
  })

  test('DISPLAY_MULTIPLIER定数を使用して変換する', () => {
    const value = 100
    expect(toInternalValue(value)).toBe(value * DISPLAY_MULTIPLIER)
  })
})

describe('toDisplayValue と toInternalValue の相互変換', () => {
  test('内部値 -> 表示値 -> 内部値で元に戻る（偶数の場合）', () => {
    const original = 100
    const display = toDisplayValue(original)
    const back = toInternalValue(display)
    expect(back).toBe(original)
  })

  test('表示値 -> 内部値 -> 表示値で元に戻る', () => {
    const original = 50
    const internal = toInternalValue(original)
    const back = toDisplayValue(internal)
    expect(back).toBe(original)
  })
})
