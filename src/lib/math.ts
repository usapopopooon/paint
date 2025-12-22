/**
 * 値をmin〜maxの範囲に制限する
 * @param value - 制限する値
 * @param min - 最小値
 * @param max - 最大値
 * @returns 範囲内に収められた値
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)
