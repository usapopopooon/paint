import type { ResizeAnchor } from '../types'

/**
 * アンカーに応じたオフセット係数を取得
 * @param anchor - リサイズの起点
 * @returns X方向とY方向のオフセット係数（0, 0.5, 1）
 */
export const getAnchorOffsetFactors = (
  anchor: ResizeAnchor
): { readonly factorX: number; readonly factorY: number } => {
  const factors: Record<ResizeAnchor, { factorX: number; factorY: number }> = {
    'top-left': { factorX: 0, factorY: 0 },
    top: { factorX: 0.5, factorY: 0 },
    'top-right': { factorX: 1, factorY: 0 },
    left: { factorX: 0, factorY: 0.5 },
    center: { factorX: 0.5, factorY: 0.5 },
    right: { factorX: 1, factorY: 0.5 },
    'bottom-left': { factorX: 0, factorY: 1 },
    bottom: { factorX: 0.5, factorY: 1 },
    'bottom-right': { factorX: 1, factorY: 1 },
  }
  return factors[anchor]
}
