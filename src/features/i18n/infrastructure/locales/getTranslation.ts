import en from './en.json'
import ja from './ja.json'
import type { Locale } from '../../types'
import { getModifierKey } from '@/lib/platform'

/**
 * 全翻訳データ
 */
export const translations = {
  en,
  ja,
} as const

/**
 * 翻訳キーの型（enをベースに生成）
 */
export type TranslationKey = keyof typeof en

/**
 * 翻訳関数の型
 * @param key - 翻訳キー
 * @param locale - ロケール（省略時は現在のロケール）
 */
export type TranslateFunction = (key: TranslationKey, locale?: Locale) => string

/**
 * 指定ロケールの翻訳を取得
 * @param locale - ロケール
 * @param key - 翻訳キー
 * @returns 翻訳されたテキスト
 */
export const getTranslation = (locale: Locale, key: TranslationKey): string => {
  const text = translations[locale][key]
  return text.replace('{modifier}', getModifierKey())
}
