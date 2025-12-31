import { DISPLAY_MULTIPLIER } from '@/constants'

/**
 * UI表示値を内部値に変換する
 * @param displayValue - UI表示用の値
 * @returns 内部で使用する実際の値（表示値の2倍）
 */
export function toInternalValue(displayValue: number): number {
  return displayValue * DISPLAY_MULTIPLIER
}
