import { getStorageItem } from '@/lib/storage'
import type { Locale } from '../types'
import { ALLOWED_LOCALES, LOCALE_STORAGE_KEY } from '../types'

/**
 * 初期ロケールを取得
 * 優先順位: LocalStorage > ブラウザ設定 > デフォルト(en)
 * @returns 初期ロケール
 */
export const getInitialLocale = (): Locale => {
  const stored = getStorageItem(LOCALE_STORAGE_KEY, ALLOWED_LOCALES)
  if (stored) return stored

  if (typeof window === 'undefined') return 'en'

  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('ja') ? 'ja' : 'en'
}
