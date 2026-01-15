import { smooth, gaussianKernel } from '@stroke-stabilizer/core'
import type { Point } from '@/features/drawable'

/**
 * 手ぶれ補正を適用してストロークのポイントを平滑化する
 * 双方向ガウシアンフィルタを使用（各ポイントの前後を考慮）
 * これにより始点・終点のずれを防ぐ
 * @param points - 生のポイント配列
 * @param size - カーネルサイズ
 * @param sigma - 標準偏差
 * @returns 平滑化されたポイント配列
 */
export const stabilizeStroke = (points: readonly Point[], size: number, sigma: number): Point[] => {
  if (points.length === 0) return []
  if (points.length === 1) return [{ ...points[0] }]
  if (size <= 1) return points.map((p) => ({ ...p }))

  return smooth([...points], {
    kernel: gaussianKernel({ size, sigma }),
    padding: 'edge',
  })
}
