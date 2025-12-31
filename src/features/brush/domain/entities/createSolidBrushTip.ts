import type { BrushTip } from '../../types'

/**
 * デフォルト設定でソリッドブラシチップを作成
 * @param size - ブラシのサイズ（ピクセル）
 * @param opacity - 不透明度（0-1、デフォルト: 1）
 * @param hardness - 輪郭のぼかし度（0-1、デフォルト: 0 = ぼかしなし）
 * @returns ソリッドブラシチップ
 */
export const createSolidBrushTip = (
  size: number,
  opacity: number = 1,
  hardness: number = 0
): BrushTip => ({
  type: 'solid',
  size,
  hardness,
  opacity,
})
