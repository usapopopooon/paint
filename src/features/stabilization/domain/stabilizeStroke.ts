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

  const kernel = createGaussianKernel(size, sigma)
  const halfSize = Math.floor(size / 2)

  // 両端をパディング（始点・終点付近も滑らかに補正できるように）
  const startPadding = Array.from({ length: halfSize }, () => ({ ...points[0] }))
  const endPadding = Array.from({ length: halfSize }, () => ({ ...points[points.length - 1] }))
  const paddedPoints = [...startPadding, ...points.map((p) => ({ ...p })), ...endPadding]

  // 全ポイントに双方向補正を適用（各ポイントを中心にカーネルを適用）
  return points.map((_, i) => {
    let sumX = 0
    let sumY = 0
    let weightSum = 0

    for (let k = 0; k < size; k++) {
      const idx = i + k // パディング分のオフセットは不要（startPaddingがhalfSize分ある）
      sumX += paddedPoints[idx].x * kernel[k]
      sumY += paddedPoints[idx].y * kernel[k]
      weightSum += kernel[k]
    }

    return {
      x: sumX / weightSum,
      y: sumY / weightSum,
    }
  })
}
