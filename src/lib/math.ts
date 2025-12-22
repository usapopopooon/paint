/**
 * 値をmin〜maxの範囲に制限する
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)
