import { describe, test, expect } from 'vitest'
import { clamp } from './math'

describe('clamp', () => {
  test('範囲内の値はそのまま返す', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  test('値が下限より小さい場合はminを返す', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  test('値が上限より大きい場合はmaxを返す', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  test('小数値でも動作する', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(-0.5, 0, 1)).toBe(0)
    expect(clamp(1.5, 0, 1)).toBe(1)
  })

  test('負の範囲でも動作する', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-15, -10, -1)).toBe(-10)
    expect(clamp(0, -10, -1)).toBe(-1)
  })

  test('境界値と等しい場合はその値を返す', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })
})
