import { sliderToValue } from './sliderToValue'
import { valueToSlider } from './valueToSlider'

/**
 * 対数スケールで次の値を計算（値が変わるまでスライダー位置を増減）
 * キーボードショートカットでツールサイズを1段階変更するときに使用
 * @param currentValue - 現在の値
 * @param min - 最小値
 * @param max - 最大値
 * @param direction - 方向（1: 増加, -1: 減少）
 * @returns 次の値
 */
export const getNextLogValue = (
  currentValue: number,
  min: number,
  max: number,
  direction: 1 | -1
): number => {
  let sliderPos = valueToSlider(currentValue, min, max)
  let newValue = currentValue

  // 値が変わるまでスライダー位置を増減（最大10回試行）
  for (let i = 0; i < 10 && newValue === currentValue; i++) {
    sliderPos = direction > 0 ? Math.min(100, sliderPos + 1) : Math.max(0, sliderPos - 1)
    newValue = sliderToValue(sliderPos, min, max)
  }

  return newValue
}
