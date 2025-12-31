import type { BrushTip } from '../../types'

/**
 * デフォルト設定でソリッドブラシチップを作成
 * @param size - ブラシのサイズ（ピクセル）
 * @param opacity - 不透明度（0-1、デフォルト: 1）
 * @returns hardness=1のソリッドブラシチップ
 */
export const createSolidBrushTip = (size: number, opacity: number = 1): BrushTip => ({
  type: 'solid',
  size,
  hardness: 1,
  opacity,
})
