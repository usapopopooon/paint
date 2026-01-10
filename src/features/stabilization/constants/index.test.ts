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
    expect(MAX_STABILIZATION).toBe(0.2)
    expect(DEFAULT_STABILIZATION).toBe(0)
  })
})

describe('stabilizationToParams', () => {
  test('stabilization=0の場合、size=1, sigma=0を返す（補正なし）', () => {
    const result = stabilizationToParams(0)
    expect(result.size).toBe(1)
    expect(result.sigma).toBe(0)
  })

  test('stabilization=0.2（UI100%）の場合、size=7を返す（最大補正）', () => {
    const result = stabilizationToParams(0.2)
    // 3 + 0.2 * (21 - 3) = 3 + 3.6 = 6.6 → 奇数に丸めて7
    expect(result.size).toBe(7)
    expect(result.sigma).toBeCloseTo(7 / 3)
  })

  test('stabilization=0.1（UI50%）の場合、size=5を返す', () => {
    const result = stabilizationToParams(0.1)
    // 3 + 0.1 * (21 - 3) = 3 + 1.8 = 4.8 → 奇数に丸めて5
    expect(result.size).toBe(5)
  })

  test('sizeは常に奇数になる', () => {
    for (let s = 0.02; s <= 0.2; s += 0.02) {
      const result = stabilizationToParams(s)
      expect(result.size % 2).toBe(1)
    }
  })

  test('sigmaはsizeの約1/3になる', () => {
    const result = stabilizationToParams(0.1)
    expect(result.sigma).toBeCloseTo(result.size / 3)
  })

  test('負の値の場合、補正なしを返す', () => {
    const result = stabilizationToParams(-0.1)
    expect(result.size).toBe(1)
    expect(result.sigma).toBe(0)
  })
})
