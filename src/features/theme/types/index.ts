/**
 * テーマの種類
 */
export type Theme = 'light' | 'dark'

/** 許可されるテーマ値のリスト */
export const ALLOWED_THEMES = ['light', 'dark'] as const

/** LocalStorageのテーマ保存キー */
export const THEME_STORAGE_KEY = 'theme'
