import { z } from 'zod'

/**
 * HEXカラーコードのスキーマ
 * #付きまたは#なしの3桁、6桁、または8桁のHEXを許容
 */
export const hexColorSchema = z
  .string()
  .regex(/^#?([a-f\d]{8}|[a-f\d]{6}|[a-f\d]{3})$/i, 'Invalid hex color format')
