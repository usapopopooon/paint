import { describe, test, expect } from 'vitest'
import { toDisplayValue } from './toDisplayValue'
import { DISPLAY_MULTIPLIER } from '@/constants'

describe('toDisplayValue', () => {
  test('内部値をUI表示値に変換する（1/2）', () => {
    expect(toDisplayValue(100)).toBe(50)
    expect(toDisplayValue(200)).toBe(100)
    expect(toDisplayValue(1600)).toBe(800)
  })

  test('小数点以下は四捨五入される', () => {
    expect(toDisplayValue(101)).toBe(51) // 101 / 2 = 50.5 -> 51
    expect(toDisplayValue(99)).toBe(50) // 99 / 2 = 49.5 -> 50
  })

  test('0は0を返す', () => {
    expect(toDisplayValue(0)).toBe(0)
  })

  test('DISPLAY_MULTIPLIER定数を使用して変換する', () => {
    const value = 100
    expect(toDisplayValue(value)).toBe(Math.round(value / DISPLAY_MULTIPLIER))
  })
})
