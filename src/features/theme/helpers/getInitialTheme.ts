import { getStorageItem } from '@/lib/storage'
import type { Theme } from '../types'
import { ALLOWED_THEMES, THEME_STORAGE_KEY } from '../constants'

/**
 * 初期テーマを取得
 * 優先順位: LocalStorage > システム設定 > デフォルト(light)
 * @returns 初期テーマ
 */
export const getInitialTheme = (): Theme => {
  const stored = getStorageItem(THEME_STORAGE_KEY, ALLOWED_THEMES)
  if (stored) return stored

  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
