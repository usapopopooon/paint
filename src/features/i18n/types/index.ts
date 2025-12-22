/**
 * サポートするロケール
 */
export type Locale = 'en' | 'ja'

/**
 * 許可されるロケールの配列（ストレージ検証用）
 */
export const ALLOWED_LOCALES = ['en', 'ja'] as const

/**
 * ロケール設定のストレージキー
 */
export const LOCALE_STORAGE_KEY = 'locale'
