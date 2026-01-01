import type { TranslationKey } from '@/features/i18n/infrastructure/locales/getTranslation'

/** 色名の翻訳キー型 */
type ColorNameKey = Extract<
  TranslationKey,
  'color.red' | 'color.orange' | 'color.yellow' | 'color.green' | 'color.cyan' | 'color.blue' | 'color.purple' | 'color.magenta'
>

/**
 * 色相から色名のキーを取得
 * @param hue - 色相 (0-360)
 * @returns 翻訳キー
 */
export const getColorNameKey = (hue: number): ColorNameKey => {
  const normalizedHue = ((hue % 360) + 360) % 360

  if (normalizedHue < 15 || normalizedHue >= 345) return 'color.red'
  if (normalizedHue < 45) return 'color.orange'
  if (normalizedHue < 75) return 'color.yellow'
  if (normalizedHue < 165) return 'color.green'
  if (normalizedHue < 195) return 'color.cyan'
  if (normalizedHue < 255) return 'color.blue'
  if (normalizedHue < 285) return 'color.purple'
  return 'color.magenta'
}
