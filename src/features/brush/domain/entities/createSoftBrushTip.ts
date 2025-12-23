import type { BrushTip } from '../../types'

/**
 * 設定可能なハードネスでソフトブラシチップを作成
 * @param size - ブラシのサイズ（ピクセル）
 * @param hardness - エッジの硬さ（0-1、デフォルト: 0.5）
 * @param opacity - 不透明度（0-1、デフォルト: 1）
 * @returns 指定されたパラメータのソフトブラシチップ
 */
export const createSoftBrushTip = (
  size: number,
  hardness: number = 0.5,
  opacity: number = 1
): BrushTip => ({
  type: 'soft',
  size,
  hardness,
  opacity,
})
