import { en } from './en'
import { ja } from './ja'
import type { Locale } from '../types'

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
 */
export type TranslateFunction = (key: TranslationKey) => string

/**
 * 指定ロケールの翻訳を取得
 */
export const getTranslation = (locale: Locale, key: TranslationKey): string => {
  return translations[locale][key]
}
