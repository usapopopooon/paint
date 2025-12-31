import { DISPLAY_MULTIPLIER } from '@/constants'

/**
 * 内部値をUI表示値に変換する
 * @param internalValue - 内部で使用する実際の値
 * @returns UI表示用の値（内部値の1/2）
 */
export function toDisplayValue(internalValue: number): number {
  return Math.round(internalValue / DISPLAY_MULTIPLIER)
}
