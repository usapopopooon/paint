import type { Drawable } from '../types'
import { isStrokeDrawable } from './typeGuards'

/**
 * Drawableからhardness値を取得（0=ぼかしなし、1=最大ぼかし）
 */
export const getHardness = (drawable: Drawable): number => {
  if (isStrokeDrawable(drawable)) {
    return drawable.style.brushTip.hardness
  }
  return 0
}

/**
 * hardness値からBlurFilterの強度を計算
 * hardness=0 → blur=0（ぼかしなし）
 * hardness=1 → blur=最大値（ブラシサイズに応じた最大ぼかし）
 */
export const calculateBlurStrength = (hardness: number, brushSize: number): number => {
  // hardnessが0の場合はブラーなし
  if (hardness === 0) return 0
  // ブラシサイズの約1/4をベースに、hardnessで調整
  return hardness * Math.max(1, brushSize * 0.25)
}
