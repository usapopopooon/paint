/** 最小補正強度（0 = 補正なし） */
export const MIN_STABILIZATION = 0

/** 最大補正強度 */
export const MAX_STABILIZATION = 1

/** デフォルト補正強度（0 = 補正なし） */
export const DEFAULT_STABILIZATION = 0

/** 手ぶれ補正フィルタの最小カーネルサイズ */
const MIN_KERNEL_SIZE = 3

/** 手ぶれ補正フィルタの最大カーネルサイズ */
const MAX_KERNEL_SIZE = 21

/**
 * 補正強度（0-1）から手ぶれ補正のパラメータに変換
 * @param stabilization - 補正強度（0-1）
 * @returns { size: カーネルサイズ, sigma: 標準偏差 }
 */
export const stabilizationToParams = (stabilization: number): { size: number; sigma: number } => {
  if (stabilization <= 0) {
    return { size: 1, sigma: 0 }
  }

  // stabilization 0-1 を size 3-21 にマッピング（奇数のみ）
  const rawSize = MIN_KERNEL_SIZE + stabilization * (MAX_KERNEL_SIZE - MIN_KERNEL_SIZE)
  const size = Math.floor(rawSize / 2) * 2 + 1 // 奇数に丸める

  // sigmaはカーネルサイズの約1/3が良いバランス
  const sigma = size / 3

  return { size, sigma }
}
