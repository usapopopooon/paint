import { describe, test, expect } from 'vitest'
import {
  MIN_STABILIZATION,
  MAX_STABILIZATION,
  DEFAULT_STABILIZATION,
  stabilizationToParams,
} from './index'

describe('stabilization constants', () => {
  test('定数が正しい値を持つ', () => {
    expect(MIN_STABILIZATION).toBe(0)
    expect(MAX_STABILIZATION).toBe(1)
    expect(DEFAULT_STABILIZATION).toBe(0)
  })
})

describe('stabilizationToParams', () => {
  test('stabilization=0の場合、size=1, sigma=0を返す（補正なし）', () => {
    const result = stabilizationToParams(0)
    expect(result.size).toBe(1)
    expect(result.sigma).toBe(0)
  })

  test('stabilization=1の場合、size=21, sigma=7を返す（最大補正）', () => {
    const result = stabilizationToParams(1)
    expect(result.size).toBe(21)
    expect(result.sigma).toBeCloseTo(7)
  })

  test('stabilization=0.5の場合、size=13を返す', () => {
    const result = stabilizationToParams(0.5)
    // 3 + 0.5 * (21 - 3) = 3 + 9 = 12 → 奇数に丸めて13
    expect(result.size).toBe(13)
  })

  test('sizeは常に奇数になる', () => {
    for (let s = 0.1; s <= 1; s += 0.1) {
      const result = stabilizationToParams(s)
      expect(result.size % 2).toBe(1)
    }
  })

  test('sigmaはsizeの約1/3になる', () => {
    const result = stabilizationToParams(0.5)
    expect(result.sigma).toBeCloseTo(result.size / 3)
  })

  test('負の値の場合、補正なしを返す', () => {
    const result = stabilizationToParams(-0.5)
    expect(result.size).toBe(1)
    expect(result.sigma).toBe(0)
  })
})
