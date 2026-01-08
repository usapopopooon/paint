import { z } from 'zod'

/**
 * HEXカラーコードのスキーマ（RGB部分のみ、アルファなし）
 * #付きまたは#なしの3桁または6桁のHEXを許容
 */
export const hexColorSchema = z
  .string()
  .regex(/^#?([a-f\d]{6}|[a-f\d]{3})$/i, 'Invalid hex color format')
