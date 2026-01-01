import en from './en.json'
import ja from './ja.json'
import type { Locale } from '../../types'
import { validateTranslation } from '../../domain'
import { getModifierKey } from '@/lib/platform'

/**
 * 検証済み翻訳データ
 */
const validatedEn = validateTranslation(en, 'en')
const validatedJa = validateTranslation(ja, 'ja')

/**
 * 全翻訳データ
 */
export const translations = {
  en: validatedEn,
  ja: validatedJa,
} as const

/**
 * 翻訳キーの型（enをベースに生成）
 */
export type TranslationKey = keyof typeof en

/**
 * 翻訳パラメータの型
 */
export type TranslationParams = Record<string, string | number>

/**
 * 翻訳関数の型
 * @param key - 翻訳キー
 * @param params - 置換パラメータ（オプション）
 * @param locale - ロケール（省略時は現在のロケール）
 */
export type TranslateFunction = (
  key: TranslationKey,
  params?: TranslationParams,
  locale?: Locale
) => string

/**
 * 指定ロケールの翻訳を取得
 * @param locale - ロケール
 * @param key - 翻訳キー
 * @param params - 置換パラメータ（オプション）
 * @returns 翻訳されたテキスト
 */
export const getTranslation = (
  locale: Locale,
  key: TranslationKey,
  params?: TranslationParams
): string => {
  let text = translations[locale][key]
  text = text.replace('{modifier}', getModifierKey())

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(`{${paramKey}}`, String(value))
    }
  }

  return text
}
