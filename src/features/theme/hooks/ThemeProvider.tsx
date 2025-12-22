import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { Theme } from '../types'
import { ALLOWED_THEMES, THEME_STORAGE_KEY } from '../types'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

/**
 * 初期テーマを取得
 * 優先順位: LocalStorage > システム設定 > デフォルト(light)
 * @returns 初期テーマ
 */
const getInitialTheme = (): Theme => {
  const stored = getStorageItem(THEME_STORAGE_KEY, ALLOWED_THEMES)
  if (stored) return stored

  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * ThemeProviderコンポーネントのプロパティ
 */
type ThemeProviderProps = {
  readonly children: ReactNode
  readonly defaultTheme?: Theme
}

/**
 * テーマを管理するProviderコンポーネント
 * @param props - ThemeProviderコンポーネントのプロパティ
 */
export const ThemeProvider = ({ children, defaultTheme }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme ?? getInitialTheme)

  // テーマ変更時にDOMクラスとLocalStorageを更新
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setStorageItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  /**
   * テーマを設定
   * @param newTheme - 新しいテーマ
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  /** ライト/ダークテーマを切り替え */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  /** Context valueをメモ化（子コンポーネントの不要な再レンダリングを防ぐ） */
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
