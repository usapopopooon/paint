import { describe, test, expect } from 'vitest'
import { getNextLogValue } from './getNextLogValue'

describe('getNextLogValue', () => {
  describe('増加方向（direction: 1）', () => {
    test('小さい値から次の値に増加する', () => {
      const result = getNextLogValue(1, 1, 100, 1)
      expect(result).toBeGreaterThan(1)
    })

    test('中間値から次の値に増加する', () => {
      const result = getNextLogValue(10, 1, 100, 1)
      expect(result).toBeGreaterThan(10)
    })

    test('最大値では変化しない', () => {
      const result = getNextLogValue(100, 1, 100, 1)
      expect(result).toBe(100)
    })

    test('ペン幅の範囲で動作する（1-300）', () => {
      const result = getNextLogValue(5, 1, 300, 1)
      expect(result).toBeGreaterThan(5)
      expect(result).toBeLessThanOrEqual(300)
    })
  })

  describe('減少方向（direction: -1）', () => {
    test('大きい値から次の値に減少する', () => {
      const result = getNextLogValue(100, 1, 100, -1)
      expect(result).toBeLessThan(100)
    })

    test('中間値から次の値に減少する', () => {
      const result = getNextLogValue(10, 1, 100, -1)
      expect(result).toBeLessThan(10)
    })

    test('最小値では変化しない', () => {
      const result = getNextLogValue(1, 1, 100, -1)
      expect(result).toBe(1)
    })

    test('ペン幅の範囲で動作する（1-300）', () => {
      const result = getNextLogValue(50, 1, 300, -1)
      expect(result).toBeLessThan(50)
      expect(result).toBeGreaterThanOrEqual(1)
    })
  })

  describe('連続操作', () => {
    test('連続して増加すると値が単調増加する', () => {
      let value = 1
      const values = [value]
      for (let i = 0; i < 5; i++) {
        value = getNextLogValue(value, 1, 100, 1)
        values.push(value)
      }
      // 各値が前の値より大きいことを確認
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
      }
    })

    test('連続して減少すると値が単調減少する', () => {
      let value = 100
      const values = [value]
      for (let i = 0; i < 5; i++) {
        value = getNextLogValue(value, 1, 100, -1)
        values.push(value)
      }
      // 各値が前の値より小さいことを確認
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeLessThanOrEqual(values[i - 1])
      }
    })
  })

  describe('境界値', () => {
    test('ブラシ幅の範囲で動作する（5-300）', () => {
      expect(getNextLogValue(5, 5, 300, 1)).toBeGreaterThan(5)
      expect(getNextLogValue(5, 5, 300, -1)).toBe(5)
      expect(getNextLogValue(300, 5, 300, 1)).toBe(300)
      expect(getNextLogValue(300, 5, 300, -1)).toBeLessThan(300)
    })

    test('消しゴム幅の範囲で動作する（5-300）', () => {
      expect(getNextLogValue(5, 5, 300, 1)).toBeGreaterThan(5)
      expect(getNextLogValue(5, 5, 300, -1)).toBe(5)
      expect(getNextLogValue(300, 5, 300, 1)).toBe(300)
      expect(getNextLogValue(300, 5, 300, -1)).toBeLessThan(300)
    })
  })
})
