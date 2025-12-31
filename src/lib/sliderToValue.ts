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
