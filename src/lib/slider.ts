/**
 * 実際の値をスライダー位置（0-100）に変換
 * 小さな値をより滑らかに操作するための対数スケール変換
 * @param value - 変換する値
 * @param min - 最小値
 * @param max - 最大値
 * @returns スライダー位置（0-100）
 */
export const valueToSlider = (value: number, min: number, max: number): number => {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  return ((Math.log(value) - minLog) / (maxLog - minLog)) * 100
}

/**
 * スライダー位置（0-100）を実際の値に変換
 * @param slider - スライダー位置（0-100）
 * @param min - 最小値
 * @param max - 最大値
 * @returns 変換された値（整数に丸められる）
 */
export const sliderToValue = (slider: number, min: number, max: number): number => {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  const value = Math.exp(minLog + (slider / 100) * (maxLog - minLog))
  return Math.round(value)
}
