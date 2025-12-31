import type { Point } from '@/features/drawable'

/**
 * ガウシアンカーネルを生成
 * @param size - カーネルサイズ（奇数推奨）
 * @param sigma - 標準偏差
 * @returns カーネル配列
 */
const createGaussianKernel = (size: number, sigma: number): number[] => {
  const kernel: number[] = []
  const center = Math.floor(size / 2)

  for (let i = 0; i < size; i++) {
    const x = i - center
    kernel.push(Math.exp(-(x * x) / (2 * sigma * sigma)))
  }

  return kernel
}

/**
 * 手ぶれ補正を適用してストロークのポイントを平滑化する
 * 内部ではガウシアンフィルタ（FIR）を使用
 * 終端から遅れた分だけ後から平滑化される
 * @param points - 生のポイント配列
 * @param size - カーネルサイズ
 * @param sigma - 標準偏差
 * @returns 平滑化されたポイント配列
 */
export const stabilizeStroke = (points: readonly Point[], size: number, sigma: number): Point[] => {
  if (points.length === 0) return []
  if (points.length === 1) return [{ ...points[0] }]
  if (size <= 1) return points.map((p) => ({ ...p }))

  const kernel = createGaussianKernel(size, sigma)
  const center = Math.floor(size / 2)

  // 始点を複製してパディング（始点付近も滑らかに補正できるように）
  const padding = Array.from({ length: center }, () => ({ ...points[0] }))
  const paddedPoints = [...padding, ...points.map((p) => ({ ...p }))]

  // 全ポイントに補正を適用
  return points.map((_, i) => {
    let sumX = 0
    let sumY = 0
    let weightSum = 0

    for (let k = 0; k < size; k++) {
      const idx = i + k
      if (idx < paddedPoints.length) {
        sumX += paddedPoints[idx].x * kernel[k]
        sumY += paddedPoints[idx].y * kernel[k]
        weightSum += kernel[k]
      }
    }

    return {
      x: sumX / weightSum,
      y: sumY / weightSum,
    }
  })
}
