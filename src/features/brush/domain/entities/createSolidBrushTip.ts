import type { BrushTip } from '../../types'

/**
 * デフォルト設定でソリッドブラシチップを作成
 * @param size - ブラシのサイズ（ピクセル）
 * @returns hardness=1, opacity=1のソリッドブラシチップ
 */
export const createSolidBrushTip = (size: number): BrushTip => ({
  type: 'solid',
  size,
  hardness: 1,
  opacity: 1,
})
