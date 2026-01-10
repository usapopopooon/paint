import { describe, test, expect } from 'vitest'
import { stabilizeStroke } from './stabilizeStroke'
import type { Point } from '@/features/drawable'

describe('stabilizeStroke', () => {
  describe('エッジケース', () => {
    test('空配列の場合、空配列を返す', () => {
      const result = stabilizeStroke([], 5, 1)
      expect(result).toEqual([])
    })

    test('1点のみの場合、その点をそのまま返す', () => {
      const points: Point[] = [{ x: 10, y: 20 }]
      const result = stabilizeStroke(points, 5, 1)
      expect(result).toEqual([{ x: 10, y: 20 }])
    })

    test('size <= 1の場合、補正なしでポイントをコピーして返す', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ]
      const result = stabilizeStroke(points, 1, 0)
      expect(result).toEqual(points)
      // 元の配列とは別のオブジェクトであることを確認
      expect(result[0]).not.toBe(points[0])
    })
  })

  describe('基本的な平滑化', () => {
    test('ジグザグなポイントが平滑化される', () => {
      // ジグザグパターン: y座標が上下に振れる
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 },
        { x: 30, y: 10 },
        { x: 40, y: 0 },
      ]
      const result = stabilizeStroke(points, 3, 1)

      // 中間点のy座標が平滑化されて極端な値から中央に寄る
      expect(result[2].y).toBeGreaterThan(0)
      expect(result[2].y).toBeLessThan(10)
    })

    test('直線上のポイントは傾きが保たれる', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
        { x: 40, y: 40 },
      ]
      const result = stabilizeStroke(points, 3, 1)

      // 中間点付近では直線に近い結果になる
      // 始点と終点は境界効果があるため、中間点でテスト
      const midIndex = 2
      expect(result[midIndex].x).toBeCloseTo(points[midIndex].x, 0)
      expect(result[midIndex].y).toBeCloseTo(points[midIndex].y, 0)
    })

    test('出力のポイント数は入力と同じ', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 5 },
        { x: 20, y: 10 },
        { x: 30, y: 15 },
        { x: 40, y: 20 },
      ]
      const result = stabilizeStroke(points, 5, 1.5)
      expect(result.length).toBe(points.length)
    })
  })

  describe('両端パディング', () => {
    test('始点付近も補正が適用される', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 20 }, // 急な動き
        { x: 20, y: 20 },
        { x: 30, y: 20 },
        { x: 40, y: 20 },
      ]
      const result = stabilizeStroke(points, 5, 1.5)

      // 2点目は補正により始点と3点目の間に引っ張られる
      expect(result[1].y).toBeLessThan(20)
      expect(result[1].y).toBeGreaterThan(0)
    })

    test('始点は始点付近のポイントに影響を受ける', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ]
      const result = stabilizeStroke(points, 3, 1)

      // 始点はパディングにより始点自身に強く影響を受けるが、
      // 後続のポイントにも多少引っ張られる
      expect(result[0].x).toBeGreaterThanOrEqual(0)
      expect(result[0].y).toBeGreaterThanOrEqual(0)
    })

    test('終点付近も補正が適用される', () => {
      const points: Point[] = [
        { x: 0, y: 20 },
        { x: 10, y: 20 },
        { x: 20, y: 20 },
        { x: 30, y: 20 }, // 急な動き
        { x: 40, y: 0 },
      ]
      const result = stabilizeStroke(points, 5, 1.5)

      // 4点目は補正により終点と3点目の間に引っ張られる
      expect(result[3].y).toBeGreaterThan(0)
      expect(result[3].y).toBeLessThan(20)
    })

    test('終点は終点付近のポイントに影響を受ける', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ]
      const result = stabilizeStroke(points, 3, 1)

      // 終点はパディングにより終点自身に強く影響を受けるが、
      // 先行のポイントにも多少引っ張られる
      expect(result[2].x).toBeLessThanOrEqual(10)
      expect(result[2].y).toBeLessThanOrEqual(10)
    })
  })

  describe('カーネルサイズの影響', () => {
    test('大きいカーネルサイズほど強く平滑化される', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: 20, y: 0 },
        { x: 30, y: 20 },
        { x: 40, y: 0 },
      ]

      const resultSmall = stabilizeStroke(points, 3, 1)
      const resultLarge = stabilizeStroke(points, 7, 2)

      // 大きいカーネルの方がより平滑化される（y座標の分散が小さい）
      const varianceSmall = calculateVariance(resultSmall.map((p) => p.y))
      const varianceLarge = calculateVariance(resultLarge.map((p) => p.y))

      expect(varianceLarge).toBeLessThan(varianceSmall)
    })
  })

  describe('イミュータビリティ', () => {
    test('元の配列を変更しない', () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ]
      const originalPoints = JSON.parse(JSON.stringify(points))

      stabilizeStroke(points, 5, 1.5)

      expect(points).toEqual(originalPoints)
    })
  })
})

// 分散を計算するヘルパー関数
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length
}
